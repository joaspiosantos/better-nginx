import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { NginxCli } from "../ports/nginx-cli";

const execAsync = promisify(exec);

export function createCliNginxAdapter(): NginxCli {
	return {
		async test() {
			try {
				await execAsync("nginx -t");
				return { ok: true };
			} catch (error) {
				const output = error instanceof Error ? error.message : String(error);
				return { ok: false, output };
			}
		},
		async reload() {
			await execAsync("nginx -s reload");
		},
	};
}
