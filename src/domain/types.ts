import { z } from "zod";

const proxyHostSchema = z.object({
	kind: z.literal("proxy"),
	name: z.string().min(1),
	domains: z.array(z.string().min(1)).min(1),
	scheme: z.enum(["http", "https"]).default("http"),
	targetHost: z.string().min(1),
	targetPort: z.string().min(1),
	source: z.enum(["manual", "docker"]).default("manual"),
	containerId: z.string().optional(),
});

const redirectHostSchema = z.object({
	kind: z.literal("redirect"),
	name: z.string().min(1),
	domains: z.array(z.string().min(1)).min(1),
	forwardScheme: z.enum(["http", "https"]).default("http"),
	forwardDomain: z.string().min(1),
	statusCode: z.enum(["301", "302"]).default("301"),
});

const deadHostSchema = z.object({
	kind: z.literal("dead"),
	name: z.string().min(1),
	domains: z.array(z.string().min(1)).min(1),
});

const streamHostSchema = z.object({
	kind: z.literal("stream"),
	name: z.string().min(1),
	listen: z.string().min(1),
	targetHost: z.string().min(1),
	targetPort: z.string().min(1),
	source: z.enum(["manual", "docker"]).default("manual"),
	containerId: z.string().optional(),
});

export const hostSchema = z.discriminatedUnion("kind", [
	proxyHostSchema,
	redirectHostSchema,
	deadHostSchema,
	streamHostSchema,
]);

export type HostKind = Host["kind"];
export type ProxyHost = z.infer<typeof proxyHostSchema>;
export type RedirectHost = z.infer<typeof redirectHostSchema>;
export type DeadHost = z.infer<typeof deadHostSchema>;
export type StreamHost = z.infer<typeof streamHostSchema>;
export type Host = z.infer<typeof hostSchema>;
