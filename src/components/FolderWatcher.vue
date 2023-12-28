<script setup lang="ts">
import { open } from "@tauri-apps/api/dialog";
import { DebouncedEvent, watch } from "tauri-plugin-fs-watch-api";
import { readTextFile } from "@tauri-apps/api/fs";
import { PgnPushResponse } from "../types";
import { useLogStore } from "../stores/logs";
import { lichessFetch } from "../utils";

const logs = useLogStore();

const props = defineProps<{
  broadcastRoundId: string;
}>();

async function selectPgnFolder() {
  open({ directory: true }).then((selected) => {
    if (selected === null) {
      return;
    }

    if (typeof selected !== "string") {
      throw new Error("Expected a single folder to be selected");
    }

    startWatchingFolder(selected);
  });
}

async function startWatchingFolder(path: string) {
  const stopWatching = await watch(path, handleFolderChange, {
    recursive: true,
    delayMs: 1000,
  });

  logs.watchProcesses.set(props.broadcastRoundId, {
    folder: path,
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
      logs.info(`Modified: ${event.path}`);

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

      logs.info(`Uploaded: ${data.moves} moves from ${path}`);
      logs.files.add(path);
      logs.moveCount += data.moves;
    });
}
</script>

<template>
  <form class="mt-2">
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
  </form>
</template>
