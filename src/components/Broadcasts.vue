<script setup lang="ts">
import ndjson from 'fetch-ndjson'
import { invoke } from "@tauri-apps/api/tauri";
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

getBroadcasts((value) => {
  broadcasts.value.push(value)
}).then(() => {
  console.log('done fetching broadcasts')
})
</script>

<template>
  <div class="flex">
    <h3 class=" text-2xl text-white">Your Broadcasts</h3>

    <div class="grow text-right text-gray-200 text-sm space-x-4">
      <a href="#" @click="openMyBroadcasts" class="underline">
        View on Lichess
      </a>
      <a href="#" @click="openBrowser('/broadcast/new')" class="underline">
        &plus; Create a new broadcast
      </a>
    </div>
  </div>

  <div class="text-white">
    <ul>
      <li v-for="broadcast in broadcasts" class="border-b-2">
        tour:
        {{ broadcast.tour.id }}
        {{ broadcast.tour.name }}
        {{ broadcast.tour.slug }}
        {{ broadcast.tour.description }}
        {{ broadcast.tour.official }}
        <br>
        round:
        {{ broadcast.round.id }}
        {{ broadcast.round.name }}
        {{ broadcast.round.slug }}
        {{ broadcast.round.url }}
        {{ broadcast.round.finished }}
        {{ broadcast.round.ongoing }}
        {{ broadcast.round.startsAt }}
        <br>
        writable: {{ broadcast.study.writeable }}
      </li>
    </ul>
  </div>
</template>
