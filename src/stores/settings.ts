import { defineStore } from 'pinia';
import { getName, getVersion } from '@tauri-apps/api/app';
import { platform } from '@tauri-apps/plugin-os';
import { AvailableUpdate } from '../types';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    lichessUrl: 'https://lichess.org',
    version: 'unknown',
    updateAvailable: null as AvailableUpdate | null,
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
    setUpdateAvailable(version: string, currentVersion: string) {
      this.updateAvailable = { version, currentVersion };
    },
    clearUpdateAvailable() {
      this.updateAvailable = null;
    },
  },
  persist: true,
});
