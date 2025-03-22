import { getName, getVersion } from '@tauri-apps/api/app';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSystemStore = defineStore('system', () => {
  const appName = ref<string>('');
  getName().then(name => {
    appName.value = name;
  });

  const appVersion = ref<string>('');
  getVersion().then(version => {
    appVersion.value = version;
  });

  const uaPrefix = (): string => `${appName.value}/${appVersion.value}`;

  return {
    appVersion,
    uaPrefix,
  };
});
