import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LichessBroadcast } from '../types';

export const useBroadcastsStore = defineStore('broadcasts', () => {
  const broadcasts = ref<LichessBroadcast[]>([]);

  const add = (broadcast: LichessBroadcast) => {
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
