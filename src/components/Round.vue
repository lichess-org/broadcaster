<script setup lang="ts">
import { computed, ref } from 'vue';
import { router } from '../router';
import { useSettingsStore } from '../stores/settings';
import { RoundResponse } from '../types';
import { useUserStore } from '../stores/user';
import NewFolderSync from './NewFolderSync.vue';
import { openBrowser, timestampToLocalDatetime } from "../utils";
import { useLogStore } from '../stores/logs';

const settings = useSettingsStore();
const user = useUserStore();
const logs = useLogStore()

const round = ref<RoundResponse | null>(null);

function getRound() {
  fetch(`${settings.lichessUrl}/api/broadcast/-/-/${router.currentRoute.value.params.id}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${user.accessToken?.access_token}`,
    }
  })
    .then(response => response.json() as Promise<RoundResponse>)
    .then(data => {
      round.value = data;
    })
}

getRound();

function refresh() {
  getRound();
}

const startsAt = computed<string>(() => {
  return timestampToLocalDatetime(round.value?.startsAt)
})

const isBroadcasting = computed<boolean>(() => {
  if (!round.value) {
    return false;
  }

  return logs.currentBroadcastThreads.has(round.value?.id)
})
</script>

<template>
  <template v-if="round">
    <div class="md:flex md:items-center md:justify-between mb-4">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">{{ round.name }}
        </h2>
        <p class="text-gray-200">{{ startsAt }}</p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0 space-x-1">
        <button type="button" @click="refresh"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20">Refresh</button>
        <button type="button" @click="openBrowser(round.url)"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20">View
          on Lichess</button>
      </div>
    </div>

    <div v-if="isBroadcasting">
      <div class="border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              This round is currently being broadcasted.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <h3 class="text-white text-xl mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="inline-block w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Upload PGN
      </h3>
      <p class="text-gray-200">Monitor a local folder and automatically upload PGN files to Lichess.</p>
      <NewFolderSync :broadcast-round-id="round.id" />
    </div>

    <h3 class="text-white text-xl my-4">
      Games
      <span class="text-gray-400">({{ round.games.length }})</span>
    </h3>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <a v-for="game in round.games" href="#" @click="openBrowser(game.url)"
        class="bg-gray-700 text-gray-100 hover:bg-gray-600 py-2 px-4"
        :class="{ 'bg-green-800 hover:bg-green-700': game.ongoing }">
        {{ game.name }}
        <span class="float-right">{{ game.res }}</span>
      </a>
    </div>
  </template>
</template>
