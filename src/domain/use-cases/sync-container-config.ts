import type { Host } from "../../domain/types";
import type { ConfigRepository } from "../../ports/config-repository";
import type {
	DiscoveredContainer,
	DockerClient,
} from "../../ports/docker-client";
import type { NginxCli } from "../../ports/nginx-cli";
import { applyHost } from "./apply-host";

function toProxyHost(container: DiscoveredContainer): Host {
	return {
		kind: "proxy",
		name: `docker-${container.name}`,
		domains: [container.host],
		scheme: "http",
		targetHost: container.ip,
		targetPort: container.port,
		source: "docker",
		containerId: container.id,
	};
}

export function startContainerSync(deps: {
	repo: ConfigRepository;
	cli: NginxCli;
	docker: DockerClient;
}) {
	const { repo, cli, docker } = deps;

	const syncAll = async () => {
		const containers = await docker.listEnabledContainers();
		for (const container of containers) {
			await applyHost({ repo, cli }, toProxyHost(container));
		}
	};

	docker.watchEvents({
		onStart: (container) => {
			void applyHost({ repo, cli }, toProxyHost(container));
		},
		onDie: async (containerId) => {
			const hosts = await repo.list();
			const match = hosts.find(
				(h) => "containerId" in h && h.containerId === containerId,
			);
			if (!match) return;

			await repo.remove(match.name);
			const result = await cli.test();
			if (result.ok) await cli.reload();
		},
	});

	return syncAll();
}
