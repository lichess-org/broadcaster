import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    lichessUrl: 'https://lichess.org',
    version: 'unknown',
  }),
  actions: {
    setLichessUrl(url: string) {
      this.lichessUrl = url.replace(/\/$/, '');
    },
    setVersion(v: string) {
      this.version = v;
    },
  },
  persist: true,
});
