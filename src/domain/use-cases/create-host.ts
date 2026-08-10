import { randomUUID } from "node:crypto";
import { hostSchema } from "../../domain/types";
import { createError, ERROR_CODES } from "../../http/errors";
import type { ConfigRepository } from "../../ports/config-repository";
import type { NginxCli } from "../../ports/nginx-cli";
import { applyHost } from "./apply-host";

export async function createHost(
	deps: { repo: ConfigRepository; cli: NginxCli },
	input: unknown,
) {
	const withGeneratedName = { ...(input as object), name: randomUUID() };
	const parsed = hostSchema.safeParse(withGeneratedName);
	if (!parsed.success) {
		return {
			success: false as const,
			error: createError(
				ERROR_CODES.HOST_INVALID,
				"Invalid host payload",
				parsed.error.flatten(),
			),
		};
	}

	return applyHost(deps, parsed.data);
}
