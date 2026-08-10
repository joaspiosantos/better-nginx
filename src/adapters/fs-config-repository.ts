import { Database } from "bun:sqlite";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Host } from "../domain/types";
import type { ConfigRepository } from "../ports/config-repository";

const HTTP_DIR = process.env.NGINX_CONF_DIR ?? "/etc/nginx/conf.d";
const STREAM_DIR = process.env.NGINX_STREAM_DIR ?? "/etc/nginx/stream.d";
const BACKUP_DIR =
	process.env.NGINX_BACKUP_DIR ?? join(HTTP_DIR, "../better-nginx-backups");
const DB_PATH =
	process.env.NGINX_DB_PATH ?? join(HTTP_DIR, "../better-nginx.sqlite");

function dirFor(kind: Host["kind"]) {
	return kind === "stream" ? STREAM_DIR : HTTP_DIR;
}

function renderTag(host: Host): string {
	if (host.kind === "redirect" || host.kind === "dead") return "manual";
	return host.containerId ? `${host.source}:${host.containerId}` : host.source;
}

function render(host: Host): string {
	const header = `# managed-by: better-nginx (${renderTag(host)})`;

	if (host.kind === "stream") {
		return [
			header,
			"server {",
			`  listen ${host.listen};`,
			`  proxy_pass ${host.targetHost}:${host.targetPort};`,
			"}",
		].join("\n");
	}

	if (host.kind === "redirect") {
		return [
			header,
			"server {",
			"  listen 80;",
			`  server_name ${host.domains.join(" ")};`,
			"  location / {",
			`    return ${host.statusCode} ${host.forwardScheme}://${host.forwardDomain}$request_uri;`,
			"  }",
			"}",
		].join("\n");
	}

	if (host.kind === "dead") {
		return [
			header,
			"server {",
			"  listen 80;",
			`  server_name ${host.domains.join(" ")};`,
			"  location / {",
			"    return 404;",
			"  }",
			"}",
		].join("\n");
	}

	// HTTP/HTTPS sempre compartilham a porta 80 (virtual host por domínio).
	// 443 com TLS real chega quando houver gestão de certificado.
	return [
		header,
		"server {",
		"  listen 80;",
		`  server_name ${host.domains.join(" ")};`,
		"  location / {",
		`    proxy_pass ${host.scheme}://${host.targetHost}:${host.targetPort};`,
		"  }",
		"}",
	].join("\n");
}

function rowToHost(row: Record<string, unknown>): Host {
	const kind = row.kind as Host["kind"];
	const base = { name: row.id as string };

	if (kind === "stream") {
		return {
			...base,
			kind: "stream",
			listen: row.listen as string,
			targetHost: row.target_host as string,
			targetPort: row.target_port as string,
			source: row.source as "manual" | "docker",
			containerId: (row.container_id as string | null) ?? undefined,
		};
	}

	if (kind === "redirect") {
		return {
			...base,
			kind: "redirect",
			domains: JSON.parse(row.domains as string),
			forwardScheme: row.forward_scheme as "http" | "https",
			forwardDomain: row.forward_domain as string,
			statusCode: row.status_code as "301" | "302",
		};
	}

	if (kind === "dead") {
		return {
			...base,
			kind: "dead",
			domains: JSON.parse(row.domains as string),
		};
	}

	return {
		...base,
		kind: "proxy",
		domains: JSON.parse(row.domains as string),
		scheme: row.scheme as "http" | "https",
		targetHost: row.target_host as string,
		targetPort: row.target_port as string,
		source: row.source as "manual" | "docker",
		containerId: (row.container_id as string | null) ?? undefined,
	};
}

function openDb() {
	const db = new Database(DB_PATH, { create: true });
	db.run(`
    CREATE TABLE IF NOT EXISTS hosts (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      domains TEXT,
      scheme TEXT,
      forward_scheme TEXT,
      forward_domain TEXT,
      status_code TEXT,
      listen TEXT,
      target_host TEXT,
      target_port TEXT,
      source TEXT,
      container_id TEXT
    )
  `);
	return db;
}

export function createFsConfigRepository(): ConfigRepository {
	const db = openDb();

	const getRow = (id: string): Host | null => {
		const row = db.query("SELECT * FROM hosts WHERE id = ?").get(id) as Record<
			string,
			unknown
		> | null;
		return row ? rowToHost(row) : null;
	};

	const upsertRow = (host: Host) => {
		db.run(
			`INSERT INTO hosts (id, kind, domains, scheme, forward_scheme, forward_domain, status_code, listen, target_host, target_port, source, container_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         kind = excluded.kind, domains = excluded.domains, scheme = excluded.scheme,
         forward_scheme = excluded.forward_scheme, forward_domain = excluded.forward_domain,
         status_code = excluded.status_code, listen = excluded.listen,
         target_host = excluded.target_host, target_port = excluded.target_port,
         source = excluded.source, container_id = excluded.container_id`,
			[
				host.name,
				host.kind,
				"domains" in host ? JSON.stringify(host.domains) : null,
				host.kind === "proxy" ? host.scheme : null,
				host.kind === "redirect" ? host.forwardScheme : null,
				host.kind === "redirect" ? host.forwardDomain : null,
				host.kind === "redirect" ? host.statusCode : null,
				host.kind === "stream" ? host.listen : null,
				host.kind === "proxy" || host.kind === "stream"
					? host.targetHost
					: null,
				host.kind === "proxy" || host.kind === "stream"
					? host.targetPort
					: null,
				host.kind === "proxy" || host.kind === "stream" ? host.source : null,
				host.kind === "proxy" || host.kind === "stream"
					? (host.containerId ?? null)
					: null,
			],
		);
	};

	const deleteRow = (id: string) => {
		db.run("DELETE FROM hosts WHERE id = ?", [id]);
	};

	const confPath = (host: Host) => join(dirFor(host.kind), `${host.name}.conf`);

	return {
		async list() {
			const rows = db.query("SELECT * FROM hosts").all() as Record<
				string,
				unknown
			>[];
			return rows.map(rowToHost);
		},
		async get(name) {
			return getRow(name);
		},
		async save(host) {
			const previous = getRow(host.name);
			if (previous && dirFor(previous.kind) !== dirFor(host.kind)) {
				await rm(confPath(previous), { force: true });
			}

			const dir = dirFor(host.kind);
			await mkdir(dir, { recursive: true });
			await writeFile(confPath(host), render(host), "utf8");
			upsertRow(host);
		},
		async remove(name) {
			const host = getRow(name);
			if (host) await rm(confPath(host), { force: true });
			deleteRow(name);
		},
		async backup(name) {
			const host = getRow(name);
			if (!host) return null;

			await mkdir(BACKUP_DIR, { recursive: true });
			const backupPath = join(BACKUP_DIR, `${name}-${Date.now()}.json`);
			await writeFile(backupPath, JSON.stringify(host), "utf8");
			return backupPath;
		},
		async restore(_name, backupPath) {
			const snapshot = JSON.parse(await readFile(backupPath, "utf8")) as Host;
			const dir = dirFor(snapshot.kind);
			await mkdir(dir, { recursive: true });
			await writeFile(confPath(snapshot), render(snapshot), "utf8");
			upsertRow(snapshot);
		},
	};
}
