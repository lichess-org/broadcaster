import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getName, getVersion } from '@tauri-apps/api/app';
import { platform } from '@tauri-apps/plugin-os';
import Database from '@tauri-apps/plugin-sql';
import { AvailableUpdate } from '../types';

export const useSettingsStore = defineStore('settings', () => {
  let dbPromise: Promise<Database> | null = null;

  const lichessUrl = ref('');
  const version = ref('unknown');
  const updateAvailable = ref<AvailableUpdate | null>(null);

  async function getDb(): Promise<Database> {
    if (!dbPromise) {
      dbPromise = Database.load('sqlite:lichess-broadcaster.db');
    }
    return dbPromise;
  }

  const loadLichessUrl = async (): Promise<void> => {
    const database = await getDb();
    const result = await database.select<Array<{ value: string }>>(
      "SELECT value FROM settings WHERE key = 'lichess_url'",
      [],
    );

    if (result.length > 0) {
      lichessUrl.value = result[0].value;
    }
  };

  const setLichessUrl = async (url: string): Promise<void> => {
    const normalizedUrl = url.replace(/\/$/, '');
    lichessUrl.value = normalizedUrl;

    const database = await getDb();
    await database.execute(
      "UPDATE settings SET value = $1 WHERE key = 'lichess_url'",
      [normalizedUrl],
    );
  };

  const setVersion = async (): Promise<void> => {
    const appName: string = await getName();
    const appVersion: string = await getVersion();
    const platformName: string = platform();
    const versionString: string = `${appName}/${appVersion} os:${platformName}`;
    version.value = versionString;
  };

  const setUpdateAvailable = (updateVersion: string, currentVersion: string): void => {
    updateAvailable.value = { version: updateVersion, currentVersion };
  };

  const clearUpdateAvailable = (): void => {
    updateAvailable.value = null;
  };

  // Load lichessUrl on store initialization
  loadLichessUrl();

  return {
    lichessUrl,
    version,
    updateAvailable,
    loadLichessUrl,
    setLichessUrl,
    setVersion,
    setUpdateAvailable,
    clearUpdateAvailable,
  };
});
