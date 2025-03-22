<script setup lang="ts">
import { ref } from 'vue';
import { router } from '../router';
import { BroadcastRound } from '../types';
import FolderWatcher from './FolderWatcher.vue';
import RoundTimes from './RoundTimes.vue';
import { openPath } from '@tauri-apps/plugin-opener';
import { useSettingsStore } from '../stores/settings';
import { lichessApiClient } from '../client';

const settings = useSettingsStore();
const round = ref<BroadcastRound | null>(null);

function getRound() {
  lichessApiClient()
    .GET('/api/broadcast/{broadcastTournamentSlug}/{broadcastRoundSlug}/{broadcastRoundId}', {
      params: {
        path: {
          broadcastTournamentSlug: '-',
          broadcastRoundSlug: '-',
          broadcastRoundId: router.currentRoute.value.params.id as string,
        },
      },
    })
    .then(response => {
      if (response.data) {
        round.value = response.data;
      }
    });
}

getRound();
</script>

<template>
  <template v-if="round">
    <div class="md:flex md:items-center md:justify-between mb-4">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          {{ round.round.name }}
          <span class="ml-2 text-gray-400">/ {{ round.tour.name }}</span>
        </h2>
        <p class="text-gray-200 text-xl">{{ round.tour.description }}</p>
        <RoundTimes :round="round.round" />
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0 space-x-1">
        <button
          type="button"
          @click="getRound"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-white/20"
        >
          Refresh
        </button>

        <button
          type="button"
          @click="round?.round.url && openPath(round.round.url)"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-white/20"
        >
          View on Lichess
        </button>
        <button
          type="button"
          @click="openPath(`${settings.lichessUrl}/broadcast/${round?.tour.id}/new`)"
          class="inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          &plus; New Round
        </button>
      </div>
    </div>

    <FolderWatcher v-if="round.study.writeable" :round="round" />
    <div v-else class="mt-4 bg-yellow-50 text-yellow-800 py-4 px-4">
      <svg class="inline h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd"
        />
      </svg>
      You do not have Contributor access to this study so you can't upload PGN.
    </div>
  </template>
</template>
