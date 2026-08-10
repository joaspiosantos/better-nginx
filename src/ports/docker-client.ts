export type DiscoveredContainer = {
	id: string;
	name: string;
	ip: string;
	host: string;
	port: string;
};

export type DockerClient = {
	listEnabledContainers: () => Promise<DiscoveredContainer[]>;
	// TODO(better-nginx): remove once discovery goes back to label-only, see TODO.md
	listAllContainers: () => Promise<DiscoveredContainer[]>;
	watchEvents: (handlers: {
		onStart: (container: DiscoveredContainer) => void;
		onDie: (containerId: string) => void;
	}) => void;
};
