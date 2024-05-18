<script setup lang="ts">
import { computed } from 'vue';
import { BroadcastRoundInfo } from '../types';
import { delayDisplay, relativeTimeDisplay, timestampToLocalDatetime } from '../utils';

const props = defineProps<{
  round: BroadcastRoundInfo;
}>();

const delay = computed<string>(() => {
  return delayDisplay(props.round.delay);
});

const relativeTime = computed<string>(() => {
  return relativeTimeDisplay(props.round.startsAt);
});

const startsAt = computed<string>(() => {
  return timestampToLocalDatetime(props.round.startsAt);
});
</script>

<template>
  <div v-if="startsAt" class="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
    <p class="truncate">{{ startsAt }}</p>
    <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 flex-none fill-gray-300">
      <circle cx="1" cy="1" r="1" />
    </svg>
    <p class="whitespace-nowrap">{{ relativeTime }}</p>
    <template v-if="delay">
      <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 flex-none fill-gray-300">
        <circle cx="1" cy="1" r="1" />
      </svg>
      <p class="whitespace-nowrap">Move Delay: {{ delay }}</p>
    </template>
  </div>
</template>
