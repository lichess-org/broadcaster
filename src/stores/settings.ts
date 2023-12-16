import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const lichessUrl = ref<string>("https://lichess.org");

    const setLichessUrl = (url: string) => {
      lichessUrl.value = url.replace(/\/$/, "");
    };

    return {
      lichessUrl,
      setLichessUrl,
    };
  },
  {
    persist: true,
  },
);
