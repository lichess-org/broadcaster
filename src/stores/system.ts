import { getName, getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSystemStore = defineStore("system", () => {
  const appName = ref<string>("");
  getName().then((name) => {
    appName.value = name;
  });

  const appVersion = ref<string>("");
  getVersion().then((version) => {
    appVersion.value = version;
  });

  const tauriVersion = ref<string>("");
  getTauriVersion().then((version) => {
    tauriVersion.value = version;
  });

  const uaPrefix = () => {
    return `${appName.value}/${appVersion.value} tauri:${tauriVersion.value}`;
  };

  return {
    appVersion,
    uaPrefix,
  };
});
