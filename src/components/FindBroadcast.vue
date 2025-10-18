<script setup lang="ts">
import { ref } from 'vue';
import { convertLichessUrlToDeepLink, openDeepLink } from '../deep-links';
import { useSettingsStore } from '../stores/settings';
import { RouteNames, router } from '../router';

const settings = useSettingsStore();
const url = ref<string>('');

async function go() {
  try {
    openDeepLink([convertLichessUrlToDeepLink(url.value)]);
  } catch (e) {
    router.push({ name: RouteNames.NotFound.toString() });
  }
}
</script>

<template>
  <h2 class="text-gray-400 text-2xl font-bold leading-7 sm:truncate sm:text-3xl sm:tracking-tight">Find a Broadcast</h2>

  <div class="mt-6 max-w-2xl">
    <form @submit.prevent="go">
      <label for="email" class="block text-sm/6 font-medium text-gray-900 dark:text-white">Lichess URL</label>
      <div class="mt-2">
        <input
          type="text"
          id="lichessUrl"
          v-model="url"
          class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
          :placeholder="settings.lichessUrl + '/broadcast/...'"
          autocomplete="off"
        />
      </div>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400" id="email-description">
        Copy + paste the URL for the broadcast or round here from Lichess
      </p>

      <div class="mt-8 flex">
        <button
          type="submit"
          class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Go
        </button>
      </div>
    </form>
  </div>
</template>
