<script setup lang="ts">
import { computed } from 'vue';
import { LichessPaginatedBroadcasts } from '../types';

const props = defineProps<{
  broadcasts?: LichessPaginatedBroadcasts;
}>();

const rangeMin = computed<number>(() => {
  if (!props.broadcasts) return 0;
  return (props.broadcasts.currentPage - 1) * props.broadcasts.maxPerPage + 1;
});

const rangeMax = computed<number>(() => {
  if (!props.broadcasts) return 0;
  return Math.min(props.broadcasts.nbResults, props.broadcasts.currentPage * props.broadcasts.maxPerPage);
});
</script>

<template>
  <nav
    v-if="broadcasts?.nbResults"
    class="flex items-center justify-between bg-gray-600 px-4 py-3 sm:px-6"
    aria-label="Pagination"
  >
    <div class="hidden sm:block">
      <p class="text-sm text-gray-300">
        Showing
        <span class="font-medium">{{ rangeMin }}</span>
        to
        <span class="font-medium">{{ rangeMax }}</span>
        of
        <span class="font-medium">{{ broadcasts.nbResults }}</span>
        {{ broadcasts.nbResults === 1 ? 'result' : 'results' }}
      </p>
    </div>
    <div class="flex flex-1 justify-between sm:justify-end">
      <router-link
        :to="{
          params: { pageNum: broadcasts.previousPage },
        }"
        :disabled="!broadcasts.previousPage"
        class="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        :class="{
          'text-gray-900': broadcasts.previousPage,
          'text-gray-400 pointer-events-none': !broadcasts.previousPage,
        }"
      >
        Previous
      </router-link>
      <router-link
        :to="{
          params: { pageNum: broadcasts.nextPage },
        }"
        :disabled="!broadcasts.nextPage"
        class="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        :class="{
          'text-gray-900': broadcasts.nextPage,
          'text-gray-400 pointer-events-none': !broadcasts.nextPage,
        }"
      >
        Next
      </router-link>
    </div>
  </nav>
</template>
