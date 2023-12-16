import { defineStore } from "pinia";
import { ref } from "vue";

export const useWatcherStore = defineStore("watcher", () => {
  const foo = ref(0);

  return {
    foo,
  };
});
