<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";

import { open } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";
import { FolderContentsChangedEvent } from "../types";

const broadcastToken = ref("");
const currentRoundSlug = ref<string | null>(null);
const pgnFolder = ref<string | null>(null);

const showLogs = ref(false);
const logs = ref<string[]>([]);

listen<FolderContentsChangedEvent>('folder-contents-changed', (event) => {
  let currentTime = new Date().toLocaleTimeString();
  let entry = `[${currentTime}] ${event.payload.kind} ${event.payload.paths}`;
  logs.value.push(entry);
});

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
    token: broadcastToken.value,
    round: currentRoundSlug.value,
    folder: pgnFolder.value,
  });

  showLogs.value = true;
}
</script>

<template>
  <template>
    <h3 class="text-3xl text-white">broadcast</h3>

    <template v-if="showLogs">
      <div class="my-4 rounded-lg p-4 text-center bg-teal-600 text-white">
        Watching folder {{ pgnFolder }} for PGN updates...
      </div>
      <div class="bg-white text-left p-4 text-sm">
        <p v-for="log in logs" class="font-mono">{{ log }}</p>
      </div>
    </template>
    <template v-else>
      <h3 class="text-xl text-white">Select which round:</h3>
      <form class="w-full max-w-sm mx-auto my-4">
        <select v-model="currentRoundSlug"
          class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
          <option :value="null">Select a round</option>
        </select>

        <button @click="selectPgnFolder"
          class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded mt-4"
          type="button">
          Select Folder
        </button>
        <p class="font-mono text-white text-sm">{{ pgnFolder }}</p>

        <button @click="startWatchingFolder" v-if="currentRoundSlug && pgnFolder"
          class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 border-4 text-white py-1 px-2 rounded mt-4 text-2xl"
          type="button">
          Start Watching
        </button>
      </form>
    </template>

  </template>
</template>
