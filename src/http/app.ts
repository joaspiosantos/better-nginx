import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { createHost } from "../domain/use-cases/create-host";
import { deleteHost } from "../domain/use-cases/delete-host";
import { getHost } from "../domain/use-cases/get-host";
import { listHosts } from "../domain/use-cases/list-hosts";
import { updateHost } from "../domain/use-cases/update-host";
import type { ConfigRepository } from "../ports/config-repository";
import type { DockerClient } from "../ports/docker-client";
import type { NginxCli } from "../ports/nginx-cli";

export function createApp(deps: {
	repo: ConfigRepository;
	cli: NginxCli;
	docker: DockerClient;
}) {
	const app = new Hono();

	app.get("/api/hosts", async (c) => {
		const hosts = await listHosts(deps.repo);
		return c.json(hosts);
	});

	app.get("/api/hosts/:name", async (c) => {
		const result = await getHost(deps.repo, c.req.param("name"));
		if (!result.success) return c.json(result.error, 404);
		return c.json(result.data);
	});

	app.post("/api/hosts", async (c) => {
		const body = await c.req.json();
		const result = await createHost(deps, body);
		if (!result.success) return c.json(result.error, 422);
		return c.json(result.data, 201);
	});

	app.put("/api/hosts/:name", async (c) => {
		const body = await c.req.json();
		const result = await updateHost(deps, {
			...body,
			name: c.req.param("name"),
		});
		if (!result.success) return c.json(result.error, 422);
		return c.json(result.data);
	});

	app.delete("/api/hosts/:name", async (c) => {
		const result = await deleteHost(deps, c.req.param("name"));
		if (!result.success) return c.json(result.error, 404);
		return c.body(null, 204);
	});

	// TODO(better-nginx): switch to listEnabledContainers() once discovery goes back to label-only, see TODO.md
	app.get("/api/containers", async (c) => {
		const containers = await deps.docker.listAllContainers();
		return c.json(containers);
	});

	app.use("/*", serveStatic({ root: "./web/dist" }));
	app.get("/*", serveStatic({ path: "./web/dist/index.html" }));

	return app;
}
