import { UnlistenFn } from "@tauri-apps/api/event";
import { defineStore } from "pinia";
import { ref } from "vue";

interface Log {
  date: Date;
  message: string;
}

export const useLogStore = defineStore("logs", () => {
  const logs = ref<Log[]>([]);
  const files = ref<Set<string>>(new Set());
  const moveCount = ref(0);

  const watchProcesses = ref<Map<string, UnlistenFn>>(new Map());

  const add = (message: string) => {
    logs.value.push({
      date: new Date(),
      message,
    });
  };

  return {
    logs,
    files,
    moveCount,
    watchProcesses,
    add,
  };
});
