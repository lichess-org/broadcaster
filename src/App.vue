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
          <router-link to="/" class="nav-item" active-class="active">
            Home
          </router-link>

          <router-link to="/broadcasts" class="nav-item" active-class="active" v-if="user.isLoggedIn()">
            Broadcasts
          </router-link>

          <router-link to="/settings" class="nav-item" active-class="active">
            Settings
          </router-link>
        </nav>
      </div>
    </header>

    <router-view />
  </div>
</template>
