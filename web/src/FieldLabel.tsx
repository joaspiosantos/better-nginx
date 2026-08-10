import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { HelpCircle } from "lucide-react";

export function FieldLabel({ text, hint }: { text: string; hint: string }) {
	return (
		<Group gap={4} wrap="nowrap">
			<Text
				component="span"
				fz={11}
				tt="uppercase"
				c="var(--text-dim)"
				style={{ letterSpacing: "0.08em" }}
			>
				{text}
			</Text>
			<Tooltip
				label={
					<Text fz={12} style={{ whiteSpace: "pre-line" }} maw={240}>
						{hint}
					</Text>
				}
				multiline
				withArrow
				position="top-start"
				events={{ hover: true, focus: true, touch: true }}
			>
				<ActionIcon
					component="span"
					variant="transparent"
					size={14}
					c="var(--text-dim)"
					style={{
						cursor: "help",
						border: "1px solid var(--line-bright)",
						borderRadius: "50%",
					}}
				>
					<HelpCircle size={10} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

export function labelWithHint(text: string, hint: string) {
	return <FieldLabel text={text} hint={hint} />;
}
