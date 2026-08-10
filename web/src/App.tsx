import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Group,
	MantineProvider,
	Modal,
	Stack,
	Tabs,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import "@mantine/core/styles.css";
import { createHost, deleteHost, fetcher, updateHost } from "./api";
import { DeadHostForm } from "./DeadHostForm";
import { ProxyHostForm } from "./ProxyHostForm";
import { RedirectionHostForm } from "./RedirectionHostForm";
import { StreamHostForm } from "./StreamHostForm";
import { theme } from "./theme";
import type {
	DeadHost,
	Host,
	HostKind,
	ProxyHost,
	RedirectHost,
	StreamHost,
} from "./types";

function emptyProxyHost(): ProxyHost {
	return {
		kind: "proxy",
		name: "",
		domains: [],
		scheme: "http",
		targetHost: "",
		targetPort: "",
		source: "manual",
	};
}
function emptyStreamHost(): StreamHost {
	return {
		kind: "stream",
		name: "",
		listen: "",
		targetHost: "",
		targetPort: "",
		source: "manual",
	};
}
function emptyRedirectHost(): RedirectHost {
	return {
		kind: "redirect",
		name: "",
		domains: [],
		forwardScheme: "http",
		forwardDomain: "",
		statusCode: "301",
	};
}
function emptyDeadHost(): DeadHost {
	return { kind: "dead", name: "", domains: [] };
}

function LiveDot() {
	return (
		<Box
			w={8}
			h={8}
			style={{
				borderRadius: "50%",
				background: "var(--amber)",
				animation: "pulse-dot 2s ease-in-out infinite",
			}}
		/>
	);
}

function hostLabel(host: Host): string {
	if (host.kind === "stream") return `tcp/${host.listen}`;
	return host.domains.join(", ");
}

function hostSubtitle(host: Host): string {
	if (host.kind === "stream") return `→ ${host.targetHost}:${host.targetPort}`;
	if (host.kind === "proxy")
		return `→ ${host.scheme}://${host.targetHost}:${host.targetPort}`;
	if (host.kind === "redirect")
		return `→ ${host.statusCode} ${host.forwardScheme}://${host.forwardDomain}`;
	return "→ 404";
}

const TABS: { kind: HostKind; label: string }[] = [
	{ kind: "proxy", label: "Proxy Hosts" },
	{ kind: "redirect", label: "Redirection Hosts" },
	{ kind: "dead", label: "Dead Hosts" },
	{ kind: "stream", label: "Streams" },
];

export default function App() {
	const { data: hosts, mutate, isLoading } = useSWR<Host[]>("/hosts", fetcher);
	const [tab, setTab] = useState<HostKind>("proxy");
	const [editing, setEditing] = useState<Host | null>(null);
	const [opened, { open, close }] = useDisclosure(false);

	const startEdit = (host: Host) => {
		setEditing(host);
		open();
	};

	const startCreate = () => {
		if (tab === "proxy") startEdit(emptyProxyHost());
		if (tab === "redirect") startEdit(emptyRedirectHost());
		if (tab === "dead") startEdit(emptyDeadHost());
		if (tab === "stream") startEdit(emptyStreamHost());
	};

	const handleSave = async (host: Host) => {
		if (host.name === "") {
			const { name, ...rest } = host;
			await createHost(rest);
		} else {
			await updateHost(host.name, host);
		}
		await mutate();
		close();
	};

	const handleDelete = async (name: string) => {
		if (
			!window.confirm(
				"Remover este host? Isso apaga a config do Nginx e recarrega.",
			)
		)
			return;
		await deleteHost(name);
		await mutate();
	};

	const filtered = (hosts ?? []).filter((h) => h.kind === tab);

	return (
		<MantineProvider
			theme={theme}
			defaultColorScheme="dark"
			forceColorScheme="dark"
		>
			<Stack gap={0} maw={860} mx="auto" px="md" py="xl" mih="100svh">
				<Group
					justify="space-between"
					align="baseline"
					pb="md"
					style={{ borderBottom: "1px solid var(--line)" }}
				>
					<Title
						order={1}
						fz={30}
						c="var(--text-bright)"
						style={{ letterSpacing: "0.02em" }}
					>
						BETTER
						<Text component="span" c="amber.4" inherit>
							_NGINX
						</Text>
					</Title>
					<Group gap={6}>
						<LiveDot />
						<Text
							fz={11}
							tt="uppercase"
							c="var(--text-dim)"
							style={{ letterSpacing: "0.1em" }}
						>
							sync live
						</Text>
					</Group>
				</Group>

				<Tabs
					value={tab}
					onChange={(value) => value && setTab(value as HostKind)}
					mt="md"
				>
					<Tabs.List>
						{TABS.map((t) => (
							<Tabs.Tab key={t.kind} value={t.kind}>
								{t.label}
							</Tabs.Tab>
						))}
					</Tabs.List>
				</Tabs>

				<Group justify="space-between" py="md">
					<Text
						fz={11}
						tt="uppercase"
						c="var(--text-dim)"
						style={{ letterSpacing: "0.1em" }}
					>
						{isLoading ? "loading…" : `${filtered.length} host(s)`}
					</Text>
					<Button onClick={startCreate}>+ Novo</Button>
				</Group>

				<Stack gap="xs">
					{filtered.map((host, i) => (
						<Card
							key={host.name}
							padding="md"
							className="rise-in"
							style={{ animationDelay: `${i * 40}ms` }}
						>
							<Group justify="space-between" wrap="nowrap">
								<Box>
									<Group gap={8} align="baseline">
										<Text fw={600} fz={16} c="var(--text-bright)">
											{hostLabel(host)}
										</Text>
										{"source" in host && (
											<Badge
												color={host.source === "docker" ? "teal" : "gray"}
												styles={{
													root: {
														color:
															host.source === "docker"
																? "var(--teal)"
																: "var(--text-dim)",
														borderColor:
															host.source === "docker"
																? "var(--teal)"
																: "var(--line-bright)",
													},
												}}
											>
												{host.source}
											</Badge>
										)}
									</Group>
									<Text fz={12} c="var(--text-dim)" mt={4}>
										{hostSubtitle(host)}
									</Text>
								</Box>
								<Group gap="xs">
									<Button variant="outline" onClick={() => startEdit(host)}>
										Editar
									</Button>
									<ActionIcon
										color="red"
										variant="subtle"
										onClick={() => handleDelete(host.name)}
									>
										<Trash2 size={16} />
									</ActionIcon>
								</Group>
							</Group>
						</Card>
					))}

					{filtered.length === 0 && (
						<Card padding="xl" style={{ borderStyle: "dashed" }}>
							<Text ta="center" c="var(--text-dim)" fz={13}>
								Nenhum host nesta categoria ainda.
							</Text>
						</Card>
					)}
				</Stack>

				<Modal opened={opened} onClose={close} title="Host" size="lg">
					{editing?.kind === "proxy" && (
						<ProxyHostForm initial={editing} onSave={handleSave} />
					)}
					{editing?.kind === "redirect" && (
						<RedirectionHostForm initial={editing} onSave={handleSave} />
					)}
					{editing?.kind === "dead" && (
						<DeadHostForm initial={editing} onSave={handleSave} />
					)}
					{editing?.kind === "stream" && (
						<StreamHostForm initial={editing} onSave={handleSave} />
					)}
				</Modal>
			</Stack>
		</MantineProvider>
	);
}
