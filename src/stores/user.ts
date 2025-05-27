import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AccessTokenResponse } from '../types';
import { lichessApiClient } from '../client';

export const useUserStore = defineStore(
  'user',
  () => {
    const accessToken = ref<AccessTokenResponse | null>(null);
    const expiresAt = ref<number | null>(null);
    const username = ref<string | null>(null);

    function setAccessToken(token: AccessTokenResponse) {
      accessToken.value = token;
      expiresAt.value = new Date().getTime() + token.expires_in * 1000;

      updateUser();
    }

    function updateUser() {
      lichessApiClient()
        .GET('/api/account')
        .then(response => {
          if (response.data?.username) {
            username.value = response.data.username;
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
    }

    function is(u: string): boolean {
      return u.toLowerCase() === username.value?.toLowerCase();
    }

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
  },
  {
    persist: true,
  },
);
