export type ProxyHost = {
	kind: "proxy";
	name: string;
	domains: string[];
	scheme: "http" | "https";
	targetHost: string;
	targetPort: string;
	source: "manual" | "docker";
	containerId?: string;
};

export type RedirectHost = {
	kind: "redirect";
	name: string;
	domains: string[];
	forwardScheme: "http" | "https";
	forwardDomain: string;
	statusCode: "301" | "302";
};

export type DeadHost = {
	kind: "dead";
	name: string;
	domains: string[];
};

export type StreamHost = {
	kind: "stream";
	name: string;
	listen: string;
	targetHost: string;
	targetPort: string;
	source: "manual" | "docker";
	containerId?: string;
};

export type Host = ProxyHost | RedirectHost | DeadHost | StreamHost;
export type HostKind = Host["kind"];

export type DiscoveredContainer = {
	id: string;
	name: string;
	ip: string;
	host: string;
	port: string;
};
