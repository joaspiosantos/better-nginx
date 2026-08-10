import type { Host } from "../../domain/types";
import { createError, ERROR_CODES } from "../../http/errors";
import type { ConfigRepository } from "../../ports/config-repository";
import type { NginxCli } from "../../ports/nginx-cli";

export async function applyHost(
	deps: { repo: ConfigRepository; cli: NginxCli },
	host: Host,
) {
	const { repo, cli } = deps;
	const backupPath = await repo.backup(host.name);
	await repo.save(host);

	const result = await cli.test();
	if (!result.ok) {
		await repo.remove(host.name);
		if (backupPath) await repo.restore(host.name, backupPath);

		return {
			success: false as const,
			error: createError(
				ERROR_CODES.NGINX_TEST_FAILED,
				"nginx -t failed, changes reverted",
				result.output,
			),
		};
	}

	try {
		await cli.reload();
	} catch (error) {
		return {
			success: false as const,
			error: createError(
				ERROR_CODES.NGINX_RELOAD_FAILED,
				"nginx reload failed after applying valid config",
				error instanceof Error ? error.message : String(error),
			),
		};
	}

	return { success: true as const, data: host };
}
