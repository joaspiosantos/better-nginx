import type { Host } from "../domain/types";

export type ConfigRepository = {
	list: () => Promise<Host[]>;
	get: (name: string) => Promise<Host | null>;
	save: (host: Host) => Promise<void>;
	remove: (name: string) => Promise<void>;
	backup: (name: string) => Promise<string | null>;
	restore: (name: string, backupPath: string) => Promise<void>;
};
