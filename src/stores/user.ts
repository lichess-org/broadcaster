import { defineStore } from 'pinia';
import { ref } from 'vue';
import Database from '@tauri-apps/plugin-sql';
import { AccessTokenResponse } from '../types';
import { lichessApiClient } from '../client';
import { DB_CONNECTION_STRING } from '../const';

export const useUserStore = defineStore('user', () => {
  let dbPromise: Promise<Database> | null = null;

  const accessToken = ref<string | null>(null);
  const expiresAt = ref<number | null>(null);
  const username = ref<string | null>(null);

  const enum dbKeys {
    accessToken = 'user_access_token',
    expiresAt = 'user_expires_at',
    username = 'user_username',
  }

  async function getDb(): Promise<Database> {
    if (!dbPromise) {
      dbPromise = Database.load(DB_CONNECTION_STRING);
    }
    return dbPromise;
  }

  async function getSettingValue(key: string): Promise<string | null> {
    const database = await getDb();
    const result = await database.select<Array<{ value: string }>>('SELECT value FROM settings WHERE key = ?', [key]);

    if (result.length > 0) {
      return result[0].value;
    }
    return null;
  }

  async function updateSettingValue(key: string, value: string): Promise<void> {
    const database = await getDb();
    await database.execute(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`, [
      key,
      value,
      value,
    ]);
  }

  async function loadAccessToken(): Promise<void> {
    const value = await getSettingValue(dbKeys.accessToken);

    if (value) {
      accessToken.value = value;
    }
  }

  async function loadExpiresAt(): Promise<void> {
    const value = await getSettingValue(dbKeys.expiresAt);

    if (value) {
      expiresAt.value = parseInt(value, 10);
    }
  }

  async function loadUsername(): Promise<void> {
    const value = await getSettingValue(dbKeys.username);

    if (value) {
      username.value = value;
    }
  }

  async function setAccessToken(token: AccessTokenResponse) {
    accessToken.value = token.access_token;
    expiresAt.value = Date.now() + token.expires_in * 1000;

    await updateSettingValue(dbKeys.accessToken, token.access_token);
    await updateSettingValue(dbKeys.expiresAt, expiresAt.value!.toString());
    await updateUser();
  }

  async function updateUser() {
    await lichessApiClient()
      .GET('/api/account')
      .then(async response => {
        if (!response.response.ok) {
          logout(false);
        } else if (response.data?.username) {
          username.value = response.data.username;
          await updateSettingValue(dbKeys.username, response.data.username);
        }
      });
  }

  function validateToken() {
    updateUser();
  }

  function tokenHasExpired(): boolean {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 11);

    return expiresAt.value === null || expiresAt.value < oneMonthFromNow.getTime();
  }

  function isLoggedIn(): boolean {
    return !tokenHasExpired();
  }

  async function logout(deleteRemoteToken = true) {
    if (deleteRemoteToken) {
      await lichessApiClient().DELETE('/api/token');
    }

    accessToken.value = null;
    expiresAt.value = null;
    username.value = null;

    getDb()
      .then(db => {
        db.execute(
          `DELETE FROM settings WHERE key IN (?, ?, ?)`,
          [dbKeys.accessToken, dbKeys.expiresAt, dbKeys.username],
        );
      })
      .catch(err => console.error('Failed to clear user data:', err));
  }

  function is(u: string): boolean {
    return u.toLowerCase() === username.value?.toLowerCase();
  }

  // Initialize data on store creation
  Promise.all([loadAccessToken(), loadExpiresAt(), loadUsername()]).catch(err => {
    console.error('Failed to load user data:', err);
  });

  return {
    accessToken,
    expiresAt,
    username,
    validateToken,
    setAccessToken,
    isLoggedIn,
    logout,
    is,
  };
});
