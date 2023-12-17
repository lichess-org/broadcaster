<script setup lang="ts">
import { computed } from 'vue';
import { LichessBroadcast } from '../types';
import { router } from '../router';
import { useLogStore } from '../stores/logs';

const logs = useLogStore()

const props = defineProps<{
  broadcast: LichessBroadcast
}>()

const startsAt = computed<string>(() => {
  if (!props.broadcast.round.startsAt) {
    return ''
  }

  let date = new Date(props.broadcast.round.startsAt)

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
})

const relativeTime = computed<string>(() => {
  if (!props.broadcast.round.startsAt) {
    return ''
  }

  const then = new Date(props.broadcast.round.startsAt).getTime();
  const deltaSeconds = Math.round((then - Date.now()) / 1000);

  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
})

function openRound(broadcastRoundId: string) {
  router.push({
    name: 'round',
    query: {
      broadcastRoundId,
    }
  })
}

const isBroadcasting = computed<boolean>(() => {
  return logs.currentBroadcastThreads.has(props.broadcast.round.id)
})
</script>

<template>
  <li class="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8" @click="openRound(broadcast.round.id)">
    <div class="min-w-0 flex-auto">
      <div class="flex items-center gap-x-3">
        <div class="flex-none rounded-full p-1 text-gray-500 bg-gray-100/10" :class="{
          'text-green-400 bg-green-400/10': isBroadcasting
        }">
          <div class="h-2 w-2 rounded-full bg-current"></div>
        </div>
        <h2 class="min-w-0 text-sm font-semibold leading-6 text-white">
          <a href="#" class="flex gap-x-2">
            <span class="truncate">{{ broadcast.tour.name }}</span>
            <span class="text-gray-400">/</span>
            <span class="whitespace-nowrap">{{ broadcast.round.name }}</span>
            <span class="absolute inset-0"></span>
          </a>
        </h2>
      </div>
      <div v-if="startsAt" class="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
        <p class="truncate">{{ startsAt }}</p>
        <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 flex-none fill-gray-300">
          <circle cx="1" cy="1" r="1" />
        </svg>
        <p class="whitespace-nowrap">{{ relativeTime }}</p>
      </div>
    </div>
    <svg class="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clip-rule="evenodd" />
    </svg>
  </li>
</template>
