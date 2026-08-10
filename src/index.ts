import { createCliNginxAdapter } from "./adapters/cli-nginx-adapter";
import { createDockerodeAdapter } from "./adapters/dockerode-adapter";
import { createFsConfigRepository } from "./adapters/fs-config-repository";
import { startContainerSync } from "./domain/use-cases/sync-container-config";
import { createApp } from "./http/app";

const repo = createFsConfigRepository();
const cli = createCliNginxAdapter();
const docker = createDockerodeAdapter();

startContainerSync({ repo, cli, docker }).catch((error) => {
	console.error("Docker container sync failed to start:", error);
});

const app = createApp({ repo, cli, docker });

export default {
	port: process.env.PORT ?? 3000,
	fetch: app.fetch,
};
