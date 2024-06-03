<script setup lang="ts">
import { computed, ref } from 'vue';
import { LichessBroadcastByUser, LichessBroadcastWithRounds } from '../types';
import { useLogStore } from '../stores/logs';
import { lichessFetch, relativeTimeDisplay } from '../utils';
import { paths } from '../lichess';
// import RoundTimes from './RoundTimes.vue';

const logs = useLogStore();
const isExpanded = ref<boolean>(false);
const broadcastWithRounds = ref<LichessBroadcastWithRounds | null>(null);

const props = defineProps<{
  broadcast: LichessBroadcastByUser;
}>();

const isBroadcasting = computed<boolean>(() => {
  return logs.watchProcesses.has(props.broadcast.tour.id);
});

function expand() {
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
    class="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 hover:bg-gray-700"
    @click.prevent="expand"
    href=""
  >
    <div class="min-w-0 flex-auto">
      <div class="flex items-center gap-x-3">
        <div
          class="flex-none rounded-full p-1 text-gray-500 bg-gray-100/10"
          :class="{
            'text-green-400 bg-green-400/10': isBroadcasting,
          }"
        >
          <div class="h-2 w-2 rounded-full bg-current"></div>
        </div>
        <h2 class="min-w-0 text-sm leading-6 text-white">
          <span class="flex gap-x-2">
            <span class="truncate font-semibold">{{ broadcast.tour.name }}</span>
            <span class="text-gray-400">/</span>
            <span class="whitespace-nowrap text-gray-500">{{ relativeTimeDisplay(broadcast.tour.createdAt) }}</span>
            <span class="absolute inset-0"></span>
          </span>
        </h2>
      </div>
      <!-- <RoundTimes :round="broadcast.round" /> -->
    </div>
    <svg class="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clip-rule="evenodd"
      />
    </svg>
  </a>
</template>
