import { defineStore } from 'pinia';
import { ref } from 'vue';
import Database from '@tauri-apps/plugin-sql';
import { AccessTokenResponse } from '../types';
import { lichessApiClient } from '../client';

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
      dbPromise = Database.load('sqlite:lichess-broadcaster.db');
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

  function setAccessToken(token: AccessTokenResponse) {
    accessToken.value = token.access_token;
    expiresAt.value = Date.now() + token.expires_in * 1000;

    getDb()
      .then(db => {
        db.execute(
          `INSERT INTO settings (key, value) VALUES ('${dbKeys.accessToken}', $1) ON CONFLICT(key) DO UPDATE SET value = $1`,
          [token.access_token],
        );
        db.execute(
          `INSERT INTO settings (key, value) VALUES ('${dbKeys.expiresAt}', $1) ON CONFLICT(key) DO UPDATE SET value = $1`,
          [expiresAt.value!.toString()],
        );
      })
      .catch(err => console.error('Failed to save access token:', err));

    updateUser();
  }

  function updateUser() {
    lichessApiClient()
      .GET('/api/account')
      .then(response => {
        if (!response.response.ok) {
          logout(false);
        } else if (response.data?.username) {
          username.value = response.data.username;

          getDb()
            .then(db => {
              db.execute(
                `INSERT INTO settings (key, value) VALUES ('${dbKeys.username}', $1) ON CONFLICT(key) DO UPDATE SET value = $1`,
                [response.data.username],
              );
            })
            .catch(err => console.error('Failed to save username:', err));
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

    // Clear from DB
    getDb()
      .then(db => {
        db.execute(
          `DELETE FROM settings WHERE key IN ('${dbKeys.accessToken}', '${dbKeys.expiresAt}', '${dbKeys.username}')`,
          [],
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
