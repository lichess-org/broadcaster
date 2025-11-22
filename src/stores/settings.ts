import { defineStore } from 'pinia';
import { getName, getVersion } from '@tauri-apps/api/app';
import { platform } from '@tauri-apps/plugin-os';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    lichessUrl: 'https://lichess.org',
    version: 'unknown',
  }),
  actions: {
    setLichessUrl(url: string) {
      this.lichessUrl = url.replace(/\/$/, '');
    },
    async setVersion() {
      const appName: string = await getName();
      const appVersion: string = await getVersion();
      const platformName: string = platform();
      const version: string = `${appName}/${appVersion} os:${platformName}`;
      this.version = version;
    },
  },
  persist: true,
});
