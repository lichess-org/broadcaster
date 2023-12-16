<script setup lang="ts">
import { invoke } from '@tauri-apps/api/tauri'

import { useUserStore } from '../stores/user'
import { useSettingsStore } from '../stores/settings';

const user = useUserStore()
const settings = useSettingsStore()

async function loginWithLichess() {
  await invoke('login_with_lichess', {
    lichessUrl: settings.lichessUrl,
  })
}
</script>

<template>
  <div class="text-center text-white">
    <template v-if="user.isLoggedIn()">
      <div>
        Logged in as {{ user.username }}
        -
        <button @click="user.logout()" type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm">
          Log out
        </button>
      </div>
    </template>
    <button v-else @click="loginWithLichess" type="button"
      class="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm">
      Click here to log in with Lichess
    </button>
  </div>
</template>
