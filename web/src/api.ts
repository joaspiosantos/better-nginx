import axios from "axios";
import type { Host } from "./types";

export const httpClient = axios.create({
	baseURL: "/api",
	timeout: 10_000,
});

export const fetcher = (url: string) =>
	httpClient.get(url).then((res) => res.data);

export function createHost(host: Omit<Host, "name">) {
	return httpClient.post<Host>("/hosts", host).then((res) => res.data);
}

export function updateHost(name: string, host: Host) {
	return httpClient.put<Host>(`/hosts/${name}`, host).then((res) => res.data);
}

export function deleteHost(name: string) {
	return httpClient.delete(`/hosts/${name}`);
}
