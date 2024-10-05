<script setup lang="ts">
import { computed, ref } from 'vue';
import { paths } from '@lichess-org/types';
import { router } from '../router';
import { LichessRound } from '../types';
import FolderWatcher from './FolderWatcher.vue';
import RoundTimes from './RoundTimes.vue';
import { lichessFetch, openPath } from '../utils';
import { useLogStore } from '../stores/logs';
import { useSettingsStore } from '../stores/settings';
import { uploadMultiGameFileIfExists, uploadIndividualGames } from '../upload';
// import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';

const logs = useLogStore();
const settings = useSettingsStore();
const round = ref<LichessRound | null>(null);

const watchedFolder = computed<string>(() => {
  if (!round.value) {
    return '';
  }

  return logs.watchProcesses.get(round.value.round.id)?.folder ?? '';
});

function stopWatching() {
  logs.watchProcesses.get(round.value!.round.id)?.unlisten();
  logs.watchProcesses.delete(round.value!.round.id);
}

function getRound() {
  lichessFetch(`/api/broadcast/-/-/${router.currentRoute.value.params.id}`)
    .then(
      response =>
        response.json() as Promise<
          paths['/api/broadcast/{broadcastTournamentSlug}/{broadcastRoundSlug}/{broadcastRoundId}']['get']['responses']['200']['content']['application/json']
        >,
    )
    .then(data => (round.value = data));
}

async function resetAndReupload() {
  logs.info('Resetting round and re-uploading PGNs');

  await lichessFetch(`/api/broadcast/round/${round.value!.round.id}/reset`, {
    method: 'POST',
  });

  const multiGameFiles = await uploadMultiGameFileIfExists(round.value!.round.id, watchedFolder.value);

  if (multiGameFiles.length === 0) {
    logs.info('No multi-game PGNs found, uploading individual games instead');
    await uploadIndividualGames(round.value!.round.id, watchedFolder.value);
  }
}

getRound();
</script>

<template>
  <template v-if="round">
    <div class="md:flex md:items-center md:justify-between mb-4">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          {{ round.round.name }}
          <span class="ml-2 text-gray-400">/ {{ round.tour.name }}</span>
        </h2>
        <p class="text-gray-200 text-xl">{{ round.tour.description }}</p>
        <RoundTimes :round="round.round" />
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0 space-x-1">
        <button
          type="button"
          @click="getRound"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
        >
          Refresh
        </button>

        <button
          type="button"
          @click="round?.round.url && openPath(round.round.url)"
          class="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
        >
          View on Lichess
        </button>
        <button
          type="button"
          @click="openPath(`${settings.lichessUrl}/broadcast/${round?.tour.id}/new`)"
          class="inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          &plus; New Round
        </button>
      </div>
    </div>

    <div v-if="watchedFolder">
      <div class="border-l-8 border-green-900 bg-green-800 text-gray-50 p-4">
        <div class="flex">
          <div class="ml-3">
            <p class="font-bold">This round is currently being broadcasted.</p>
            <p>
              Currently watching folder:
              <a class="underline" href="" @click.prevent="openPath(watchedFolder)">{{ watchedFolder }}</a>
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
        v-if="!logs.roundHasGamespgnFile.get(round.round.id)"
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
      <p class="text-gray-300">
        As game PGNs are written to a folder, they can be automatically be uploaded to Lichess.
      </p>

      <FolderWatcher v-if="round.study.writeable" :round-id="round.round.id" />
      <div v-else class="mt-4 bg-yellow-50 text-yellow-800 py-4 px-4">
        <svg class="inline h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clip-rule="evenodd"
          />
        </svg>
        You do not have Contributor access to this study so you can't upload PGN.
      </div>
    </div>

    <iframe
      :src="settings.lichessUrl + '/embed/broadcast/_/_/' + round.round.id + '?evals=0'"
      class="w-full aspect-[4/3] border-0 pb-4"
    ></iframe>
  </template>
</template>
