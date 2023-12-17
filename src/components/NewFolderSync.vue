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
  <form class="">
    <button @click="selectPgnFolder"
      class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded mt-4"
      type="button">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="inline-block w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
      Select Folder
    </button>
    <p class="font-mono text-white text-sm">{{ pgnFolder }}</p>

    <button @click="startWatchingFolder" v-if="pgnFolder"
      class="flex-shrink-0 bg-teal-600 hover:bg-teal-700 border-teal-600 hover:border-teal-700 border-4 text-white py-1 px-2 rounded mt-4"
      type="button">
      Start Watching
    </button>
  </form>
</template>
