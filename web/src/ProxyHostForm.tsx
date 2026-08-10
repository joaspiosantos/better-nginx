import { Button, Group, Select, Stack, TagsInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { labelWithHint } from "./FieldLabel";
import { TargetFields } from "./TargetFields";
import type { ProxyHost } from "./types";

export function ProxyHostForm({
	initial,
	onSave,
}: {
	initial: ProxyHost;
	onSave: (host: ProxyHost) => Promise<void>;
}) {
	const form = useForm<ProxyHost>({ initialValues: initial });

	return (
		<form onSubmit={form.onSubmit(async (values) => onSave(values))}>
			<Stack gap="sm">
				<TagsInput
					label={labelWithHint(
						"Domínios",
						"Um ou mais domínios que apontam pra este host.\nDigite e aperte Enter para adicionar cada um.\nEx: meusite.com, www.meusite.com",
					)}
					placeholder="meusite.com"
					{...form.getInputProps("domains")}
				/>

				<Select
					label={labelWithHint(
						"Esquema",
						"Como o Nginx fala com o backend (proxy_pass).\nSempre escuta na porta 80 pro cliente\n(virtual host por domínio) — 443 com TLS real\nchega quando houver gestão de certificado.",
					)}
					data={[
						{ value: "http", label: "HTTP" },
						{ value: "https", label: "HTTPS" },
					]}
					value={form.values.scheme}
					onChange={(value) =>
						value && form.setFieldValue("scheme", value as ProxyHost["scheme"])
					}
					allowDeselect={false}
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
