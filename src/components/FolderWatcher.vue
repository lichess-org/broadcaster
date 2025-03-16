<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog';
import { watch, WatchEvent } from '@tauri-apps/plugin-fs';
import { useLogStore } from '../stores/logs';
import { useStatusStore } from '../stores/status';
import { fileList, isMultiGamePgn, isWrite, lichessApiClient, openPath, uploadFolderToRound } from '../utils';
import { computed } from 'vue';
import debounce from 'debounce';
import { sep } from '@tauri-apps/api/path';
import { ref } from 'vue';
import { BroadcastRound } from '../types';

const logs = useLogStore();
const status = useStatusStore();

const props = defineProps<{
  round: BroadcastRound;
}>();

const roundStatus = computed(() => status.getRound(props.round.round.id));
const watchedFolder = ref('');

async function selectPgnFolder() {
  open({ directory: true }).then(async selected => {
    if (selected === null) {
      return;
    }

    if (typeof selected !== 'string') {
      throw new Error('Expected a single folder to be selected');
    }

    if (await multipleGamesPgnFiles(selected)) {
      logs.error(
        `Multiple games.pgn files were found within the selected folder (${selected}).
         Make sure you select the Round folder and not the Tournament folder.`,
      );
      return;
    }

    startWatchingFolder(selected);
  });
}

async function multipleGamesPgnFiles(path: string) {
  const files = await fileList(path, true);
  return files.filter(file => file.endsWith('games.pgn')).length > 1;
}

async function startWatchingFolder(path: string) {
  const stopWatching = await watch(path, handleFolderChange, {
    recursive: true,
    delayMs: 1000,
  });

  watchedFolder.value = path;

  status.startRound(props.round.tour.id, props.round.round.id, path, stopWatching);

  await checkForExistingPgnFiles(path);
}

async function checkForExistingPgnFiles(path: string) {
  const files = await fileList(path);
  if (files.some(file => file.endsWith('.pgn'))) {
    status.setRoundContainsAtLeastOnePgn(props.round.round.id);
  }
}

function stopWatching() {
  status.stopRound(props.round.round.id);
}

let modifiedFiles: string[] = [];

function handleFolderChange(event: WatchEvent): void {
  console.log('folder change');
  if (!isWrite(event)) return;
  console.log('is write');

  modifiedFiles.push(...event.paths.filter(file => file.endsWith('.pgn')));

  debounce(() => {
    if (modifiedFiles.length === 0) return;

    logs.info(`Modified: ${props.round.round.name} ${modifiedFiles.map(file => file.split(sep()).pop()).join(', ')}`);

    uploadFolderToRound(props.round.round.id, watchedFolder.value);
    modifiedFiles = [];

    status.setRoundContainsAtLeastOnePgn(props.round.round.id);
    if (modifiedFiles.find(filename => isMultiGamePgn(filename))) {
      status.setRoundHasMultiGamePgn(props.round.round.id);
    }
  }, 1000)();
}

async function resetAndReupload() {
  if (!roundStatus.value) return;

  logs.info('Resetting round and re-uploading PGNs');

  lichessApiClient().POST('/api/broadcast/round/{broadcastRoundId}/reset', {
    params: {
      path: {
        broadcastRoundId: props.round.round.id,
      },
    },
  });
}
</script>

<template>
  <div v-if="roundStatus">
    <div class="border-l-8 border-green-900 bg-green-800 text-gray-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <p class="font-bold">This round is currently being broadcasted.</p>
          <p>
            Currently watching folder:
            <a class="underline" href="" @click.prevent="openPath(roundStatus.watchProcess.folder)">{{
              roundStatus.watchProcess.folder
            }}</a>
          </p>

          <div class="mt-4 gap-2 flex">
            <button
              type="button"
              @click="stopWatching"
              class="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-400"
            >
              Stop watching this folder
            </button>
            <button
              type="button"
              @click="resetAndReupload"
              class="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-400"
            >
              Reset round + Re-upload game PGNs
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="!status.roundContainsAtLeastOnePgn(round.round.id)"
      class="bg-yellow-100 border-l-8 border-yellow-500 text-yellow-700 p-4 my-4"
    >
      <p>
        Warning: No <code>*.pgn</code> file(s) found in the selected folder
        <br />
        Ensure you have selected the folder for the <strong>round</strong>'s PGN files and not the parent
        <strong>tournament</strong> folder.
      </p>
    </div>
    <div
      v-else-if="!status.roundHasMultiGamePgn(round.round.id)"
      class="bg-yellow-100 border-l-8 border-yellow-500 text-yellow-700 p-4 my-4"
    >
      <p>
        Warning: There is no <code>games.pgn</code> file found in that folder. If you're using DGT LiveChess, it is
        recommended to enable that file (<a
          class="underline"
          href=""
          @click.prevent="openPath('https://lichess.org/broadcast/app#there-is-no-gamespgn-file-in-the-folder')"
          >See instructions here</a
        >)
      </p>
    </div>
  </div>

  <div v-else class="border-gray-700 border-2 p-6 my-4">
    <h3 class="text-white text-xl mb-2">
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
      Upload PGN
    </h3>
    <p class="text-gray-300">As game PGNs are written to a folder, they can be automatically be uploaded to Lichess.</p>
    <form class="mt-2">
      <button
        @click="selectPgnFolder"
        class="rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
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
  </div>
</template>
