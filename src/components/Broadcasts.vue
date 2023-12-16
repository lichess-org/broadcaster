<script setup lang="ts">
import ndjson from 'fetch-ndjson'
import { invoke } from "@tauri-apps/api/tauri";
import { LichessBroadcast } from '../types';
import { useSettingsStore } from '../stores/settings';
import { useUserStore } from '../stores/user';

const settings = useSettingsStore();
const user = useUserStore();

async function openBrowser(path: string) {
  await invoke("open_browser", {
    url: settings.lichessUrl + path,
  });
}

async function openMyBroadcasts() {
  await openBrowser(`/broadcast/by/${user.username}`)
}

async function broadcasts(callback: (value: LichessBroadcast) => void) {
  let response = await fetch(`http://localhost:8080/api/broadcast/my-rounds`, {
    headers: {
      'Authorization': `Bearer ${user.accessToken?.access_token}`,
    }
  })

  return new Promise(async (resolve) => {
    let reader = response.body!.getReader();
    let gen = ndjson(reader)

    while (true) {
      let { done, value } = await gen.next();

      if (done) {
        resolve(true)
        return
      }

      callback(value)
    }
  })
}

broadcasts((value) => {
  console.log('broadcast:', value)
}).then(() => {
  console.log('done fetching broadcasts')
})
</script>

<template>
  <h3 class="text-white text-xl">Your Broadcasts</h3>
  <button type="button" @click="openMyBroadcasts"
    class="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm">
    View on Lichess
  </button>
  <button type="button" @click="openBrowser('/broadcast/new')"
    class="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm">
    Create a new broadcast
  </button>
</template>
