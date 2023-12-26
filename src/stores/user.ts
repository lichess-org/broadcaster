import { defineStore } from "pinia";
import { ref } from "vue";
import { AccessTokenResponse, LichessUser } from "../types";
import { checkForErrors } from "../utils";
import { useSettingsStore } from "./settings";

export const useUserStore = defineStore(
  "user",
  () => {
    const accessToken = ref<AccessTokenResponse | null>(null);
    const expiresAt = ref<number | null>(null);
    const username = ref<string | null>(null);

    const settings = useSettingsStore();

    function setAccessToken(token: AccessTokenResponse) {
      accessToken.value = token;
      expiresAt.value = new Date().getTime() + token.expires_in * 1000;

      updateUser();
    }

    function updateUser() {
      fetch(`${settings.lichessUrl}/api/account`, {
        headers: {
          Authorization: `Bearer ${accessToken.value?.access_token}`,
        },
      })
        .then((response) => {
          checkForErrors(response);
          return response.json() as Promise<LichessUser>;
        })
        .then((data) => {
          username.value = data.username;
        });
    }

    function validateToken() {
      updateUser();
    }

    function tokenHasExpired(): boolean {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 11);

      return (
        expiresAt.value === null || expiresAt.value < oneMonthFromNow.getTime()
      );
    }

    function isLoggedIn(): boolean {
      return !tokenHasExpired();
    }

    function logout() {
      fetch(`${settings.lichessUrl}/api/token`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken.value?.access_token}`,
        },
      }).then(() => {
        accessToken.value = null;
        expiresAt.value = null;
        username.value = null;
      });
    }

    return {
      accessToken,
      expiresAt,
      username,
      validateToken,
      setAccessToken,
      isLoggedIn,
      logout,
    };
  },
  {
    persist: true,
  },
);
