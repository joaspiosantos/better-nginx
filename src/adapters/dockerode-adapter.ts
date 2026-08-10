import type { ContainerInfo } from "dockerode";
import Docker from "dockerode";
import type { DiscoveredContainer, DockerClient } from "../ports/docker-client";

const LABEL_PREFIX = "better-nginx";

function toDiscovered(container: ContainerInfo): DiscoveredContainer | null {
	const labels = container.Labels ?? {};
	if (labels[`${LABEL_PREFIX}.enable`] !== "true") return null;

	const host = labels[`${LABEL_PREFIX}.host`];
	const port = labels[`${LABEL_PREFIX}.port`];
	if (!host || !port) return null;

	const networks = Object.values(container.NetworkSettings?.Networks ?? {});
	const ip = networks[0]?.IPAddress;
	if (!ip) return null;

	return {
		id: container.Id,
		name: container.Names?.[0]?.replace(/^\//, "") ?? container.Id,
		ip,
		host,
		port,
	};
}

// TODO(better-nginx): remove once discovery goes back to label-only, see TODO.md
function toDiscoveredAny(container: ContainerInfo): DiscoveredContainer | null {
	const labels = container.Labels ?? {};
	const networks = Object.values(container.NetworkSettings?.Networks ?? {});
	const ip = networks[0]?.IPAddress;
	if (!ip) return null;

	const name = container.Names?.[0]?.replace(/^\//, "") ?? container.Id;
	const port =
		labels[`${LABEL_PREFIX}.port`] ??
		container.Ports?.[0]?.PrivatePort?.toString() ??
		"";

	return {
		id: container.Id,
		name,
		ip,
		host: labels[`${LABEL_PREFIX}.host`] ?? name,
		port,
	};
}

export function createDockerodeAdapter(): DockerClient {
	const docker = new Docker({ socketPath: "/var/run/docker.sock" });

	return {
		async listEnabledContainers() {
			const containers = await docker.listContainers();
			return containers
				.map(toDiscovered)
				.filter((c): c is DiscoveredContainer => c !== null);
		},
		async listAllContainers() {
			const containers = await docker.listContainers();
			return containers
				.map(toDiscoveredAny)
				.filter((c): c is DiscoveredContainer => c !== null);
		},
		watchEvents({ onStart, onDie }) {
			docker.getEvents(
				{ filters: { event: ["start", "die"] } },
				(err, stream) => {
					if (err || !stream) return;
					stream.on("data", async (chunk) => {
						const event = JSON.parse(chunk.toString());
						if (event.Type !== "container") return;

						if (event.Action === "start") {
							const info = await docker.listContainers({
								filters: { id: [event.id] },
							});
							const discovered = info[0] ? toDiscovered(info[0]) : null;
							if (discovered) onStart(discovered);
						}

						if (event.Action === "die") {
							onDie(event.id);
						}
					});
				},
			);
		},
	};
}
