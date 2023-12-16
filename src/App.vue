<script setup lang="ts">
import { useUserStore } from "./stores/user";
import { listen } from '@tauri-apps/api/event';
import { AccessTokenResponse } from "./types";
import { useSettingsStore } from "./stores/settings";

const user = useUserStore()
const settings = useSettingsStore()

listen<AccessTokenResponse>('update_access_token', (event) => {
  user.setAccessToken(event.payload)
})

listen<string>('update_lichess_url', (event) => {
  settings.lichessUrl = event.payload
})
</script>

<template>
  <div class="h-screen bg-gray-800 p-4">
    <header class="mb-12 flex">
      <div class="">
        <img src="./assets/lichess-white.svg" class="w-12 inline-block" alt="Lichess logo" />
      </div>

      <div class="grow">
        <nav class="flex space-x-4 justify-end">
          <router-link to="/"
            class="text-indigo-100 hover:text-indigo-800 hover:bg-indigo-200 rounded-md px-3 py-2 text-sm font-medium"
            active-class="bg-indigo-100 text-indigo-800">
            <template v-if="user.isLoggedIn()">
              Broadcasts
            </template>
            <template v-else>
              Login
            </template>
          </router-link>

          <router-link to="/settings"
            class="text-indigo-100 hover:text-indigo-800 hover:bg-indigo-200 rounded-md px-3 py-2 text-sm font-medium"
            active-class="bg-indigo-100 text-indigo-800">
            Settings
          </router-link>
        </nav>
      </div>
    </header>

    <router-view />
  </div>
</template>
