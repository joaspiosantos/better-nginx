import { createError, ERROR_CODES } from "../../http/errors";
import type { ConfigRepository } from "../../ports/config-repository";
import type { NginxCli } from "../../ports/nginx-cli";

export async function deleteHost(
	deps: { repo: ConfigRepository; cli: NginxCli },
	name: string,
) {
	const { repo, cli } = deps;
	const host = await repo.get(name);
	if (!host) {
		return {
			success: false as const,
			error: createError(
				ERROR_CODES.HOST_NOT_FOUND,
				`Host "${name}" not found`,
			),
		};
	}

	await repo.remove(name);
	const result = await cli.test();
	if (result.ok) await cli.reload();

	return { success: true as const, data: null };
}
