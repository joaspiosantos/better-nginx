export type NginxTestResult = { ok: true } | { ok: false; output: string };

export type NginxCli = {
	test: () => Promise<NginxTestResult>;
	reload: () => Promise<void>;
};
