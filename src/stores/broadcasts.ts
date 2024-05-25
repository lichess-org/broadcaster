import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LichessMyRound } from '../types';

export const useBroadcastsStore = defineStore('broadcasts', () => {
  const broadcasts = ref<LichessMyRound[]>([]);

  const add = (broadcast: LichessMyRound) => {
    broadcasts.value.push(broadcast);
  };

  const clear = () => {
    broadcasts.value = [];
  };

  return {
    broadcasts,
    add,
    clear,
  };
});
