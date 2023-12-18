<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { useUserStore } from "../stores/user";
import { useSettingsStore } from "../stores/settings";
import { router } from "../router";

const settings = useSettingsStore();
const user = useUserStore();

const pgnFolder = ref<string | null>(null);

const props = defineProps<{
  broadcastRoundId: string;
}>()

async function selectPgnFolder() {
  const selected = await open({ directory: true });

  if (Array.isArray(selected)) {
    throw new Error("Expected a single folder to be selected");
  } else if (selected) {
    pgnFolder.value = selected;
  }
}

async function startWatchingFolder() {
  await invoke("start_watching_folder", {
    lichessUrl: settings.lichessUrl,
    apiToken: user.accessToken?.access_token,
    broadcastRoundId: props.broadcastRoundId,
    folder: pgnFolder.value,
  });

  router.push('/');
}
</script>

<template>
  <form class="mt-2" @submit.prevent="startWatchingFolder">
    <button @click="selectPgnFolder"
      class="rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
      type="button">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="inline-block w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
      Select Folder
    </button>
    <span class="ml-3 font-mono text-white text-sm">{{ pgnFolder }}</span>

    <button v-if="pgnFolder"
      class="ml-4 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      type="submit">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="inline-block w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      Start
    </button>
  </form>
</template>
