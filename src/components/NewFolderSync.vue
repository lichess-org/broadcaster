<script setup lang="ts">
import { ref } from "vue";
import { open } from "@tauri-apps/api/dialog";
import { DebouncedEvent, watch } from "tauri-plugin-fs-watch-api";
import { readTextFile } from "@tauri-apps/api/fs";
import { PgnPushResponse } from "../types";
import { useLogStore } from "../stores/logs";
import { lichessFetch } from "../utils";

const logs = useLogStore();

const pgnFolder = ref<string | null>(null);

const props = defineProps<{
  broadcastRoundId: string;
}>();

async function selectPgnFolder() {
  const selected = await open({ directory: true });

  if (Array.isArray(selected)) {
    throw new Error("Expected a single folder to be selected");
  } else if (selected) {
    pgnFolder.value = selected;
  }
}

async function startWatchingFolder() {
  if (!pgnFolder.value) {
    throw new Error("No folder selected");
  }

  const stopWatching = await watch(pgnFolder.value, handleFolderChange, {
    recursive: true,
    delayMs: 1000,
  });

  logs.watchProcesses.set(props.broadcastRoundId, {
    folder: pgnFolder.value,
    unlisten: stopWatching,
  });
}

function handleFolderChange(events: DebouncedEvent) {
  events
    .filter((event) => event.kind === "Any" && event.path.endsWith(".pgn"))
    .filter((event) => {
      // ignore the "games.json" file which is a multi-game pgn file
      // we only want to upload single game pgn files (game-1.pgn, game-2.pgn, etc.)
      return !event.path.endsWith("games.pgn");
    })
    .forEach((event) => {
      console.log("File modified", event.path);
      logs.add(`Modified: ${event.path}`);

      uploadPgnToLichess(event.path);
    });
}

async function uploadPgnToLichess(path: string) {
  const pgn = await readTextFile(path);

  lichessFetch(`/api/broadcast/round/${props.broadcastRoundId}/push`, {
    method: "POST",
    body: pgn,
  })
    .then((response) => response.json() as Promise<PgnPushResponse>)
    .then((data) => {
      console.log("PgnPushResponse", data);

      logs.add(`Uploaded: ${data.moves} moves from ${path}`);
      logs.files.add(path);
      logs.moveCount += data.moves;
    });
}
</script>

<template>
  <form class="mt-2" @submit.prevent="startWatchingFolder">
    <button
      @click="selectPgnFolder"
      class="rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="inline-block w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
        />
      </svg>
      Select Folder
    </button>
    <span class="ml-3 font-mono text-white text-sm">{{ pgnFolder }}</span>

    <button
      v-if="pgnFolder"
      class="ml-4 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
      type="submit"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="inline-block w-4 h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      Start Upload
    </button>
  </form>
</template>
