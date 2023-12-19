<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri'
import { useSettingsStore } from '../stores/settings';

const settings = useSettingsStore()

async function login() {
  await invoke('start_oauth_flow', {
    url: settings.lichessUrl,
  })
}
</script>

<template>
  <div class="text-center mt-20">
    <h3 class="mt-2 text-xl font-semibold text-gray-200">Welcome to the Lichess PGN Broadcaster app</h3>
    <p class="mt-1 text-sm text-gray-300">Get started by logging in with your Lichess account.</p>
    <div class="mt-6">
      <button type="button" @click="login"
        class="inline-flex items-center rounded-md bg-indigo-600 px-8 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="-ml-0.5 mr-1.5 h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>

        Log in with Lichess
      </button>
    </div>
  </div>
</template>
