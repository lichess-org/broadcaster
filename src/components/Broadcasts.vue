<script setup lang="ts">
import ndjson from 'fetch-ndjson'
import { invoke } from "@tauri-apps/api/tauri";
import Broadcast from './Broadcast.vue';
import { LichessBroadcast } from '../types';
import { useSettingsStore } from '../stores/settings';
import { useUserStore } from '../stores/user';
import { ref } from 'vue';

const settings = useSettingsStore();
const user = useUserStore();

const broadcasts = ref<LichessBroadcast[]>([])

async function openBrowser(path: string) {
  await invoke("open_browser", {
    url: settings.lichessUrl + path,
  });
}

async function openMyBroadcasts() {
  await openBrowser(`/broadcast/by/${user.username}`)
}

async function getBroadcasts(callback: (value: LichessBroadcast) => void) {
  let response = await fetch(`${settings.lichessUrl}/api/broadcast/my-rounds`, {
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

getBroadcasts((value) => {
  broadcasts.value.push(value)
}).then(() => {
  console.log('done fetching broadcasts')
})
</script>

<template>
  <div class="md:flex md:items-center md:justify-between mb-4">
    <div class="min-w-0 flex-1">
      <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">Your Broadcasts</h2>
    </div>
    <div class="mt-4 flex md:ml-4 md:mt-0">
      <button type="button" @click="openMyBroadcasts"
        class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20">View
        on Lichess</button>
      <button type="button" @click="openBrowser('/broadcast/new')"
        class="ml-3 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">&plus;
        Create a new broadcast</button>
    </div>
  </div>

  <ul role="list" class="divide-y divide-white/5">
    <Broadcast v-for="broadcast in broadcasts" :broadcast="broadcast" />
  </ul>
</template>
