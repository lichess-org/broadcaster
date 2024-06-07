<script setup lang="ts">
import { reactive, watch } from 'vue';
import { BroadcastRoundGame } from '../types';
import { TheChessboard, type BoardConfig } from 'vue3-chessboard';
import { openPath } from '../utils';
import 'vue3-chessboard/style.css';

const game = defineModel<BroadcastRoundGame>({ required: true });

const boardConfig: BoardConfig = reactive({
  viewOnly: true,
  coordinates: true,
  fen: game.value.fen,
  animation: {
    enabled: true,
    duration: 100,
  },
});

defineProps<{
  showGames: Boolean;
  roundURL: string;
}>();

watch(game, (updatedGame: BroadcastRoundGame) => {
  boardConfig.fen = updatedGame.fen;
});
</script>

<template>
  <a
    href="#"
    @click="roundURL && openPath(roundURL + '/' + game.id)"
    class="bg-gray-700 text-gray-100 hover:bg-gray-600 py-2 px-4"
  >
    <span class="flex justify-between">
      {{ game.name }}
      <span class="font-bold min-w-max" :class="{ 'text-red-600': game.status === '*' }">
        <span v-if="game.status === '*'">LIVE</span> <span v-else>{{ game.status }}</span>
      </span>
    </span>
    <span v-if="showGames">
      <TheChessboard :boardConfig="boardConfig" reactive-config class="w-auto" />
    </span>
  </a>
</template>
