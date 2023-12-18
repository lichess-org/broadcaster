import { invoke } from "@tauri-apps/api";

export async function openBrowser(url: string) {
  await invoke("open_browser", { url });
}
