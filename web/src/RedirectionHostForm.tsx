import {
	Button,
	Group,
	Select,
	Stack,
	TagsInput,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { labelWithHint } from "./FieldLabel";
import type { RedirectHost } from "./types";

export function RedirectionHostForm({
	initial,
	onSave,
}: {
	initial: RedirectHost;
	onSave: (host: RedirectHost) => Promise<void>;
}) {
	const form = useForm<RedirectHost>({ initialValues: initial });

	return (
		<form onSubmit={form.onSubmit(async (values) => onSave(values))}>
			<Stack gap="sm">
				<TagsInput
					label={labelWithHint(
						"Domínios",
						"Um ou mais domínios que vão redirecionar.\nDigite e aperte Enter para adicionar cada um.",
					)}
					placeholder="antigo.com"
					{...form.getInputProps("domains")}
				/>

				<Group grow align="flex-start">
					<Select
						label={labelWithHint(
							"Esquema de destino",
							"Protocolo usado na URL de destino do redirect.",
						)}
						data={[
							{ value: "http", label: "HTTP" },
							{ value: "https", label: "HTTPS" },
						]}
						value={form.values.forwardScheme}
						onChange={(value) =>
							value &&
							form.setFieldValue(
								"forwardScheme",
								value as RedirectHost["forwardScheme"],
							)
						}
						allowDeselect={false}
					/>
					<Select
						label={labelWithHint(
							"Código HTTP",
							"301 = redirect permanente (navegadores/buscadores\nguardam em cache). 302 = temporário, sempre\nrevalida no servidor.",
						)}
						data={[
							{ value: "301", label: "301 · Permanente" },
							{ value: "302", label: "302 · Temporário" },
						]}
						value={form.values.statusCode}
						onChange={(value) =>
							value &&
							form.setFieldValue(
								"statusCode",
								value as RedirectHost["statusCode"],
							)
						}
						allowDeselect={false}
					/>
				</Group>

				<TextInput
					label={labelWithHint(
						"Domínio de destino",
						"Pra onde o visitante é redirecionado.\nO caminho e query string originais são\npreservados automaticamente.",
					)}
					placeholder="novo.com"
					{...form.getInputProps("forwardDomain")}
				/>

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
