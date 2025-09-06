<script setup lang="ts">
import { ref } from 'vue';
import { openDeepLink } from '../deep-links';

const url = ref<string>('');

async function go() {
  const parsed = new URL(url.value);
  openDeepLink([parsed.protocol + '/' + parsed.pathname + parsed.search]);
}
</script>

<template>
  <h2 class="text-gray-400 text-2xl font-bold leading-7 sm:truncate sm:text-3xl sm:tracking-tight">
    Navigate to a Broadcast by URL
  </h2>

  <div class="divide-y divide-white/5">
    <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      <form @submit.prevent="go">
        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div class="col-span-full">
            <label for="lichessUrl" class="block text-sm font-medium leading-6 text-white">Lichess URL</label>
            <div class="mt-2">
              <div
                class="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
              >
                <input
                  type="text"
                  id="lichessUrl"
                  autocomplete="off"
                  class="flex-1 border-0 bg-transparent py-1.5 px-2 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  v-model="url"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex">
          <button
            type="submit"
            class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Go
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
