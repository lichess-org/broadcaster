<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Game } from '../types';
import { TheChessboard, type BoardConfig } from 'vue3-chessboard';
import 'vue3-chessboard/style.css';

const game = defineModel<Game>({ required: true });

const boardConfig: BoardConfig = reactive({
  viewOnly: true,
  coordinates: true,
  fen: game.value.fen,
});

const props = defineProps<{
  showGames: Boolean;
}>();

// Watch for changes to the 'game' object
watch(game, (updatedGame: Game) => {
  boardConfig.fen = updatedGame.fen;
});
</script>

<template>
  {{ game.name }}
  <span class="float-right font-bold" :class="{ 'text-red-600': game.status === '*' }">
    <span v-if="game.status === '*'">LIVE</span> <span v-else>{{ game.status }}</span>
  </span>
  <span v-if="showGames">
    <TheChessboard :boardConfig="boardConfig" reactive-config class="w-auto" />
  </span>
</template>
