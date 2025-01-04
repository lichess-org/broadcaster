<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog';
import { watch, WatchEvent } from '@tauri-apps/plugin-fs';
import { useLogStore } from '../stores/logs';
import { useStatusStore } from '../stores/status';
import { add_to_queue, fileList, isMultiGamePgn, lichessFetch, multiOrSingleFilter, openPath } from '../utils';
import { LichessRound } from '../types';
import { getIndividualGamePgns, getMultiGamePgns } from '../upload';
import { computed, ref } from 'vue';

const logs = useLogStore();
const status = useStatusStore();

const props = defineProps<{
  round: LichessRound;
}>();

const roundStatus = computed(() => status.getRound(props.round.round.id));

const error = ref<string | null>(null);

async function selectPgnFolder() {
  error.value = null;

  open({ directory: true }).then(async selected => {
    if (selected === null) {
      return;
    }

    if (typeof selected !== 'string') {
      throw new Error('Expected a single folder to be selected');
    }

    if (await folderHasPgnFile(selected)) {
      startWatchingFolder(selected);
    } else {
      const errorMsg = `No *.pgn file(s) found in the selected folder: ${selected}`;
      error.value = errorMsg;
      logs.error(errorMsg);
    }
  });
}

async function folderHasPgnFile(path: string): Promise<boolean> {
  const files = await fileList(path);
  console.log(path, files);
  return files.some(file => file.endsWith('.pgn'));
}

async function startWatchingFolder(path: string) {
  const stopWatching = await watch(path, handleFolderChange, {
    recursive: true,
    delayMs: 1000,
  });

  status.startRound(props.round.tour.id, props.round.round.id, path, stopWatching);

  await uploadMultiGamePgn(path);
}

async function uploadMultiGamePgn(path: string) {
  const multiGamePgns = await getMultiGamePgns(path);
  if (multiGamePgns.length > 0) {
    add_to_queue(props.round.round.id, multiGamePgns);
    status.setRoundHasMultiGamePgn(props.round.round.id);
  }
  return multiGamePgns;
}

function stopWatching() {
  status.stopRound(props.round.round.id);
}

function handleFolderChange(event: WatchEvent): void {
  const type = event.type;
  if (typeof type !== 'string' && 'access' in type && 'mode' in type.access && type.access.mode === 'write') {
    if (event.paths.find(filename => isMultiGamePgn(filename))) {
      status.setRoundHasMultiGamePgn(props.round.round.id);
    }

    const toUpload = multiOrSingleFilter(event.paths);

    if (toUpload.length === 0) {
      return;
    }

    add_to_queue(props.round.round.id, toUpload);

    const paths = toUpload.map(file => file.split('/').pop());
    logs.info(`Modified: ${paths.join(', ')}`);
  }
}

async function resetAndReupload() {
  if (!roundStatus.value) return;

  logs.info('Resetting round and re-uploading PGNs');

  await lichessFetch(
    `/api/broadcast/round/${props.round.round.id}/reset`,
    {},
    {
      method: 'POST',
    },
  );

  const multiGameFiles = await uploadMultiGamePgn(roundStatus.value.watchProcess.folder);
  if (multiGameFiles.length === 0) {
    logs.info('No multi-game PGNs found, uploading individual games');
    const singleGameFiles = await getIndividualGamePgns(roundStatus.value.watchProcess.folder);
    add_to_queue(props.round.round.id, singleGameFiles);
  }
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
              class="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400"
            >
              Stop watching this folder
            </button>
            <button
              type="button"
              @click="resetAndReupload"
              class="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400"
            >
              Reset round + Re-upload game PGNs
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="!status.roundHasMultiGamePgn(round.round.id)"
      class="bg-yellow-100 border-l-8 border-yellow-500 text-yellow-700 p-4 mb-4"
    >
      <p>
        There is no <code>games.pgn</code> file found in that folder. If you're using DGT LiveChess, it is recommended
        to enable that file (<a
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

    <div v-if="error" class="bg-red-200 border-l-8 border-red-500 text-red-900 p-4 my-4">
      <strong>Error:</strong> {{ error }}
      <br />
      Ensure you have selected the folder for the <strong>round</strong>'s PGN files and not the parent
      <strong>tournament</strong> folder.
    </div>
  </div>
</template>
