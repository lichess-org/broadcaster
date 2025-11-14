<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import { LichessBroadcastWithRounds } from '../types';
import { lichessApiClient } from '../client';
import { useStatusStore } from '../stores/status';
import { useSettingsStore } from '../stores/settings';
import { useLogStore } from '../stores/logs';
import { useFavoritesStore } from '../stores/favorites';
import { timestampToLocalDatetime } from '../dates';
import { openPath } from '@tauri-apps/plugin-opener';
import { CheckIcon, StopIcon, BookmarkIcon as BookmarkIconSolid } from '@heroicons/vue/16/solid';
import {
  StopIcon as StopIconOutline,
  ExclamationTriangleIcon,
  BookmarkIcon as BookmarkIconOutline,
} from '@heroicons/vue/24/outline';
import RoundTimes from './RoundTimes.vue';
import { RouteNames } from '../router';

const route = useRoute();
const status = useStatusStore();
const settings = useSettingsStore();
const logs = useLogStore();
const favorites = useFavoritesStore();

const broadcastId = ref<string>(route.params.id as string);
const isLoading = ref<boolean>(true);
const broadcast = ref<LichessBroadcastWithRounds | null>(null);
const error = ref<string | null>(null);

const hasRounds = computed<boolean>(() => {
  return broadcast.value?.rounds ? broadcast.value.rounds.length > 0 : false;
});

const lichessUrl = computed<string>(() => {
  if (!broadcast.value?.tour.slug || !broadcast.value?.tour.id) return '';
  return `${settings.lichessUrl}/broadcast/${broadcast.value.tour.slug}/${broadcast.value.tour.id}`;
});

function fetchBroadcast() {
  isLoading.value = true;
  broadcast.value = null;
  error.value = null;

  lichessApiClient()
    .GET('/api/broadcast/{broadcastTournamentId}', {
      params: {
        path: {
          broadcastTournamentId: broadcastId.value,
        },
      },
    })
    .then(response => {
      if (response.data) {
        broadcast.value = response.data;
      } else {
        error.value = 'Failed to load broadcast';
        logs.error(`Error loading broadcast ${broadcastId.value}`);
      }
    })
    .catch(err => {
      error.value = 'An error occurred while loading the broadcast';
      logs.error(`Error loading broadcast ${broadcastId.value}: ${err}`);
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function togglePin() {
  if (!broadcast.value) return;

  if (favorites.isBroadcastPinned(broadcast.value.tour.id)) {
    favorites.unpinBroadcast(broadcast.value.tour.id);
  } else {
    favorites.pinBroadcast(broadcast.value.tour.id, broadcast.value.tour.name);
  }
}

fetchBroadcast();

onBeforeRouteUpdate(to => {
  broadcastId.value = to.params.id as string;
  fetchBroadcast();
});
</script>

<template>
  <div v-if="isLoading" class="flex justify-center items-center h-64">
    <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>

  <div v-else-if="broadcast">
    <div class="md:flex md:items-center md:justify-between mb-4">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          {{ broadcast.tour.name }}
        </h2>
        <p v-if="broadcast.tour.dates && broadcast.tour.dates.length > 0" class="mt-1 text-sm text-gray-400">
          {{ timestampToLocalDatetime(broadcast.tour.dates[0]) }}
        </p>
        <p v-if="broadcast.tour.description" class="mt-2 text-sm text-gray-300">
          {{ broadcast.tour.description }}
        </p>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0 space-x-1">
        <button
          type="button"
          @click="togglePin"
          class="inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs transition-colors"
          :class="
            favorites.isBroadcastPinned(broadcast.tour.id)
              ? 'bg-yellow-600 hover:bg-yellow-500'
              : 'bg-white/10 hover:bg-white/20'
          "
          :title="favorites.isBroadcastPinned(broadcast.tour.id) ? 'Unpin broadcast' : 'Pin broadcast'"
        >
          <BookmarkIconSolid v-if="favorites.isBroadcastPinned(broadcast.tour.id)" class="h-4 w-4" />
          <BookmarkIconOutline v-else class="h-4 w-4" />
          {{ favorites.isBroadcastPinned(broadcast.tour.id) ? 'Unpin' : 'Pin' }}
        </button>
        <button
          type="button"
          @click="fetchBroadcast"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-white/20"
        >
          Refresh
        </button>
        <button
          type="button"
          @click="openPath(lichessUrl)"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-white/20"
        >
          View on Lichess
        </button>
      </div>
    </div>

    <div v-if="hasRounds" class="overflow-y-auto">
      <div role="list" class="divide-y divide-white/5">
        <router-link
          v-for="round in broadcast.rounds"
          :key="round.id"
          :to="{
            name: RouteNames['RelayRound.show'].toString(),
            params: {
              ts: '-',
              rs: '-',
              id: round.id,
            },
          }"
          class="flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 hover:bg-gray-700"
          :class="{
            'bg-green-900': status.hasRound(round.id),
          }"
        >
          <div class="min-w-0 flex-auto">
            <h3 class="min-w-0 text-sm leading-4 text-white">
              <CheckIcon v-if="round.finishedAt" class="size-6 inline-block text-green-600" />
              <StopIcon v-else-if="round.ongoing" class="size-6 inline-block text-red-500" />
              <StopIconOutline v-else class="size-6 inline-block text-gray-500" />
              {{ round.name }}
            </h3>
          </div>
          <RoundTimes :round="round" />
          <em v-if="status.hasRound(round.id)" class="text-gray-400">Watching folder for changes...</em>
        </router-link>
      </div>
    </div>

    <div v-else class="text-center mt-12">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="mx-auto h-12 w-12 text-gray-400"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
        />
      </svg>

      <h3 class="mt-2 text-sm font-semibold text-gray-200">No rounds</h3>
      <p class="mt-1 text-sm text-gray-300">This broadcast doesn't have any rounds yet.</p>
    </div>
  </div>

  <div v-else-if="error" class="text-center mt-12">
    <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-red-400" />
    <h3 class="mt-2 text-sm font-semibold text-gray-200">Error loading broadcast</h3>
    <p class="mt-1 text-sm text-gray-300">{{ error }}</p>
  </div>

  <div v-else class="text-center mt-12">
    <h3 class="text-sm font-semibold text-gray-200">Broadcast not found</h3>
    <p class="mt-1 text-sm text-gray-300">Unable to load broadcast details.</p>
  </div>
</template>
