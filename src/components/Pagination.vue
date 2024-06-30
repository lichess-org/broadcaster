<script setup lang="ts">
import { computed } from 'vue';
import { BroadcastPagination } from '../types';

const resultsPerPage = 20;

const props = defineProps<{
  pages: BroadcastPagination;
  currentPageResultCount: number;
}>();

const rangeMin = computed<number>(() => {
  return (props.pages.currentPage - 1) * resultsPerPage + 1;
});

const rangeMax = computed<number>(() => {
  return rangeMin.value + props.currentPageResultCount - 1;
});
</script>

<template>
  <nav
    class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
    aria-label="Pagination"
  >
    <div class="hidden sm:block">
      <p class="text-sm text-gray-700">
        Showing
        <span class="font-medium">{{ rangeMin }}</span>
        to
        <span class="font-medium">{{ rangeMax }}</span>
        of
        <span class="font-medium">{{ pages.nbResults }}</span>
        {{ pages.nbResults === 1 ? 'result' : 'results' }}
      </p>
    </div>
    <div class="flex flex-1 justify-between sm:justify-end">
      <router-link
        v-if="pages.previousPage"
        :to="{ query: { page: pages.previousPage } }"
        class="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
      >
        Previous
      </router-link>
      <router-link
        v-if="pages.nextPage"
        :to="{ query: { page: pages.nextPage } }"
        class="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
      >
        Next
      </router-link>
    </div>
  </nav>
</template>
