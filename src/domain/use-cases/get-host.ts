import { createError, ERROR_CODES } from "../../http/errors";
import type { ConfigRepository } from "../../ports/config-repository";

export async function getHost(repo: ConfigRepository, name: string) {
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
	return { success: true as const, data: host };
}
