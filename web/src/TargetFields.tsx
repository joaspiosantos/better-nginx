import { Group, Select, Text, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import useSWR from "swr";
import { fetcher } from "./api";
import { labelWithHint } from "./FieldLabel";
import type { DiscoveredContainer } from "./types";

export function TargetFields<
	T extends { targetHost: string; targetPort: string },
>({ form }: { form: UseFormReturnType<T> }) {
	const { data: containers } = useSWR<DiscoveredContainer[]>(
		"/containers",
		fetcher,
	);

	const containerOptions = (containers ?? []).map((c) => ({
		value: c.id,
		label: `${c.name} — ${c.ip}:${c.port}`,
	}));

	const applyContainerSelection = (containerId: string | null) => {
		const container = containers?.find((c) => c.id === containerId);
		if (!container) return;
		form.setFieldValue("targetHost" as never, container.ip as never);
		if (container.port)
			form.setFieldValue("targetPort" as never, container.port as never);
	};

	return (
		<>
			<Text
				fz={11}
				tt="uppercase"
				c="var(--text-dim)"
				style={{ letterSpacing: "0.1em" }}
				mt="xs"
			>
				Destino
			</Text>

			{containerOptions.length > 0 && (
				<Select
					label={labelWithHint(
						"Container detectado",
						"Lista containers Docker rodando agora.\nSelecionar um preenche automaticamente o\nhostname/IP e a porta abaixo.",
					)}
					placeholder="Selecionar container…"
					data={containerOptions}
					onChange={applyContainerSelection}
					clearable
					searchable
				/>
			)}

			<Group grow align="flex-start">
				<TextInput
					label={labelWithHint(
						"Hostname / IP",
						"Endereço de destino da conexão.\nPode ser o IP de um container Docker\n(escolha acima) ou qualquer host acessível.",
					)}
					placeholder="10.0.0.5"
					{...form.getInputProps("targetHost" as never)}
				/>
				<TextInput
					label={labelWithHint(
						"Porta",
						"Porta em que o serviço de destino escuta.",
					)}
					placeholder="3000"
					{...form.getInputProps("targetPort" as never)}
				/>
			</Group>
		</>
	);
}
