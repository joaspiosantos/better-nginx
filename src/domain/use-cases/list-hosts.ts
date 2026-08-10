import type { ConfigRepository } from "../../ports/config-repository";

export function listHosts(repo: ConfigRepository) {
	return repo.list();
}
