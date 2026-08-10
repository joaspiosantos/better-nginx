export const ERROR_CODES = {
	HOST_NOT_FOUND: 400101,
	HOST_INVALID: 400102,
	NGINX_TEST_FAILED: 500101,
	NGINX_RELOAD_FAILED: 500102,
} as const;

export function createError(code: number, message: string, details?: unknown) {
	return { code, message, details };
}

export type AppError = ReturnType<typeof createError>;
