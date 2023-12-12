<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";

import { Broadcast, FolderContentsChangedEvent } from "../types";
import { open } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";

const broadcastToken = ref("");
const broadcast = ref<Broadcast | null>(null);
const currentRoundSlug = ref<string | null>(null);
const pgnFolder = ref<string | null>(null);

const showLogs = ref(false);
const logs = ref<string[]>([]);

listen<FolderContentsChangedEvent>('folder-contents-changed', (event) => {
  let currentTime = new Date().toLocaleTimeString();
  let entry = `[${currentTime}] ${event.payload.kind} ${event.payload.paths}`;
  logs.value.push(entry);
});

async function getBroadcast() {
  broadcast.value = await invoke("get_broadcast_by_token", { token: broadcastToken.value });
}

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
  <div class="text-center">
    <template v-if="!broadcast">
      <h3 class="text-2xl text-white">Broadcast Token:</h3>
      <form class="w-full max-w-sm mx-auto my-4" @submit.prevent="getBroadcast">
        <div class="flex items-center border-b border-teal-500 py-2">
          <input v-model="broadcastToken"
            class="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="text" placeholder="ABCD-1234-EFGH-5678">
          <button
            class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit">
            Submit
          </button>
        </div>
      </form>
      <p class="text-gray-300 text-sm">Enter the management token found on the broadcast's page on Lichess</p>
    </template>

    <template v-if="broadcast">
      <h3 class="text-3xl text-white">{{ broadcast.tour.name }}</h3>

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
            <option v-for="round in broadcast.rounds" :value="round.slug">{{ round.name }}</option>
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
  </div>
</template>
