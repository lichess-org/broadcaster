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
  <div class="h-screen bg-gray-800 p-12">
    <div class="text-center mb-12">
      <img src="./assets/lichess-white.svg" class="w-24 inline-block" alt="Lichess logo" />
    </div>

    <router-link to ="/">Home</router-link>
    <router-link to ="/settings">Settings</router-link>

    <router-view />
  </div>
</template>
