import { UnlistenFn } from "@tauri-apps/api/event";
import { defineStore } from "pinia";
import { ref } from "vue";

type LogType = "info" | "error";

interface Log {
  date: Date;
  type: LogType;
  message: string;
}

interface WatchProcess {
  folder: string;
  unlisten: UnlistenFn;
}

export const useLogStore = defineStore("logs", () => {
  const logs = ref<Log[]>([]);
  const files = ref<Set<string>>(new Set());
  const moveCount = ref(0);

  const watchProcesses = ref<Map<string, WatchProcess>>(new Map());

  const add = (message: string, type: LogType = "info") => {
    logs.value.push({
      date: new Date(),
      type,
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
