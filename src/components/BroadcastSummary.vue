<script setup lang="ts">
import { ref } from 'vue';
import { paths } from '@lichess-org/types';
import { LichessBroadcastByUser, LichessBroadcastWithRounds } from '../types';
import { useStatusStore } from '../stores/status';
import { lichessFetch, timestampToLocalDatetime } from '../utils';
import RoundTimes from './RoundTimes.vue';
import { CheckIcon, StopIcon } from '@heroicons/vue/16/solid';
import { StopIcon as StopIconOutline } from '@heroicons/vue/24/outline';

const status = useStatusStore();
const isExpanded = ref<boolean>(false);
const broadcastWithRounds = ref<LichessBroadcastWithRounds | null>(null);

const props = defineProps<{
  broadcast: LichessBroadcastByUser;
}>();

function expand() {
  if (isExpanded.value) {
    isExpanded.value = false;
    return;
  }

  isExpanded.value = true;
  getBroadcast(props.broadcast.tour.id);
}

function getBroadcast(id: string) {
  lichessFetch(`/api/broadcast/${id}`)
    .then(
      response =>
        response.json() as Promise<
          paths['/api/broadcast/{broadcastTournamentId}']['get']['responses']['200']['content']['application/json']
        >,
    )
    .then(data => (broadcastWithRounds.value = data));
}
</script>

<template>
  <a
    @click.prevent="expand"
    href=""
    class="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 hover:bg-gray-700"
    :class="{
      'bg-green-900': status.hasTournament(props.broadcast.tour.id),
    }"
  >
    <div class="min-w-0 flex-auto">
      <div class="flex items-center gap-x-3">
        <div
          class="flex-none rounded-full p-1 text-gray-500 bg-gray-100/10"
          :class="{
            'text-green-400 bg-green-400/10': status.hasTournament(props.broadcast.tour.id),
          }"
        >
          <div class="h-2 w-2 rounded-full bg-current"></div>
        </div>
        <h2 class="min-w-0 text-sm leading-6 text-white">
          <span class="flex gap-x-2">
            <span class="truncate font-semibold">{{ broadcast.tour.name }}</span>
            <template v-if="broadcast.tour.dates">
              <span class="text-gray-400">/</span>
              <span class="whitespace-nowrap text-gray-500">{{
                timestampToLocalDatetime(broadcast.tour.dates[0])
              }}</span>
            </template>
            <span class="absolute inset-0"></span>
          </span>
        </h2>
      </div>
    </div>
    <svg class="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clip-rule="evenodd"
      />
    </svg>
  </a>
  <div v-if="isExpanded" class="ml-8">
    <template v-if="broadcastWithRounds">
      <div
        v-if="broadcastWithRounds.rounds.length"
        v-for="round in broadcastWithRounds.rounds"
        :key="round.id"
      >
        <router-link
          :to="{ name: 'round', params: { id: round.id } }"
          class="flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 hover:bg-gray-700"
          :class="{
            'bg-green-900': status.hasRound(round.id),
          }"
        >
          <h3 class="min-w-0 text-sm leading-4 text-white">
            <CheckIcon v-if="round.finishedAt" class="size-6 inline-block text-green-600" />
            <StopIcon v-else-if="round.ongoing" class="size-6 inline-block text-red-500" />
            <StopIconOutline v-else class="size-6 inline-block text-gray-500" />
            {{ round.name }}
          </h3>
          <RoundTimes :round="round" />
          <em v-if="status.hasRound(round.id)" class="text-gray-400">Watching folder for changes...</em>
        </router-link>
      </div>
      <div v-else class="text-gray-400 ml-16 py-3">No rounds yet</div>
    </template>
    <svg
      v-else
      class="animate-spin m-4 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
</template>
