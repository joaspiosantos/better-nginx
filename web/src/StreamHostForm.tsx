import { Autocomplete, Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { labelWithHint } from "./FieldLabel";
import { TargetFields } from "./TargetFields";
import type { StreamHost } from "./types";

const TCP_PORT_PRESETS = [
	{ value: "3306", label: "3306 — MySQL" },
	{ value: "5432", label: "5432 — PostgreSQL" },
	{ value: "6379", label: "6379 — Redis" },
	{ value: "27017", label: "27017 — MongoDB" },
	{ value: "5672", label: "5672 — RabbitMQ" },
];

export function StreamHostForm({
	initial,
	onSave,
}: {
	initial: StreamHost;
	onSave: (host: StreamHost) => Promise<void>;
}) {
	const form = useForm<StreamHost>({ initialValues: initial });

	return (
		<form onSubmit={form.onSubmit(async (values) => onSave(values))}>
			<Stack gap="sm">
				<Autocomplete
					label={labelWithHint(
						"Listen",
						"Porta que o Nginx expõe pra este serviço.\nEscolha um serviço conhecido ou digite\nqualquer porta livre no host. Cada stream\nprecisa da sua própria porta.",
					)}
					placeholder="3306"
					data={TCP_PORT_PRESETS}
					{...form.getInputProps("listen")}
					onOptionSubmit={(value) => {
						form.setFieldValue("listen", value);
						const preset = TCP_PORT_PRESETS.find((p) => p.value === value);
						if (preset) form.setFieldValue("targetPort", preset.value);
					}}
				/>

				<TargetFields form={form} />

				<Group
					justify="flex-end"
					mt="md"
					pt="md"
					style={{ borderTop: "1px solid var(--line)" }}
				>
					<Button type="submit">Salvar e aplicar</Button>
				</Group>
			</Stack>
		</form>
	);
}
