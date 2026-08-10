import { Button, Group, Stack, TagsInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { labelWithHint } from "./FieldLabel";
import type { DeadHost } from "./types";

export function DeadHostForm({
	initial,
	onSave,
}: {
	initial: DeadHost;
	onSave: (host: DeadHost) => Promise<void>;
}) {
	const form = useForm<DeadHost>({ initialValues: initial });

	return (
		<form onSubmit={form.onSubmit(async (values) => onSave(values))}>
			<Stack gap="sm">
				<TagsInput
					label={labelWithHint(
						"Domínios",
						"Domínios que devem responder 404 de propósito.\nÚtil pra domínios desativados que ainda\napontam DNS pra esse servidor.",
					)}
					placeholder="descontinuado.com"
					{...form.getInputProps("domains")}
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
