import {
	Badge,
	Button,
	Card,
	createTheme,
	Modal,
	TextInput,
} from "@mantine/core";

export const theme = createTheme({
	primaryColor: "amber",
	fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
	fontFamilyMonospace: '"IBM Plex Mono", ui-monospace, monospace',
	headings: {
		fontFamily: '"Rajdhani", ui-sans-serif, sans-serif',
		fontWeight: "600",
	},
	defaultRadius: 0,
	colors: {
		amber: [
			"#fff8e8",
			"#ffedc2",
			"#ffdd8f",
			"#ffc95c",
			"#ffb020",
			"#f0a000",
			"#cc8600",
			"#a86c00",
			"#845400",
			"#603c00",
		],
		dark: [
			"#c7ccd1",
			"#9aa0a8",
			"#6b7280",
			"#4a4f57",
			"#3a3f47",
			"#262a30",
			"#1a1c20",
			"#14161a",
			"#101215",
			"#0a0b0d",
		],
	},
	components: {
		Card: Card.extend({
			defaultProps: { bg: "dark.8" },
			styles: {
				root: { border: "1px solid var(--line)" },
			},
		}),
		Button: Button.extend({
			defaultProps: { fw: 600 },
			styles: {
				root: {
					letterSpacing: "0.04em",
					textTransform: "uppercase",
					fontSize: "12px",
				},
			},
		}),
		Badge: Badge.extend({
			defaultProps: { radius: 0, variant: "outline" },
			styles: {
				root: {
					letterSpacing: "0.06em",
					fontFamily: '"IBM Plex Mono", monospace',
				},
			},
		}),
		TextInput: TextInput.extend({
			styles: {
				label: {
					fontSize: "11px",
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					color: "var(--text-dim)",
					marginBottom: 4,
				},
				input: {
					backgroundColor: "var(--panel)",
					borderColor: "var(--line)",
					fontFamily: '"IBM Plex Mono", monospace',
				},
			},
		}),
		Modal: Modal.extend({
			styles: {
				content: {
					backgroundColor: "var(--bg-raised)",
					border: "1px solid var(--line-bright)",
					display: "flex",
					flexDirection: "column",
					maxHeight: "90vh",
				},
				body: {
					overflowY: "auto",
					flex: 1,
				},
				header: {
					backgroundColor: "var(--bg-raised)",
					borderBottom: "1px solid var(--line)",
				},
				title: {
					fontFamily: '"Rajdhani", sans-serif',
					fontWeight: 600,
					letterSpacing: "0.04em",
					textTransform: "uppercase",
				},
			},
		}),
	},
});
