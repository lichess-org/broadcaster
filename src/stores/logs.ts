import { UnlistenFn } from "@tauri-apps/api/event";
import { defineStore } from "pinia";
import { ref } from "vue";
import { notify } from "../notify";

type LogType = "info" | "error";
type LogColor = "white" | "red" | "green";

interface Log {
  date: Date;
  type: LogType;
  message: string;
  color: LogColor;
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

  const add = (
    message: string,
    type: LogType = "info",
    color: LogColor = "white",
  ) => {
    logs.value.push({
      date: new Date(),
      type,
      message,
      color,
    });
  };

  const info = (message: string, color: LogColor = "white") => {
    add(message, "info", color);
  };

  const error = (message: string) => {
    add(message, "error", "red");
    notify("Error", message);
  };

  const clear = () => {
    logs.value = [];
  };

  return {
    logs,
    files,
    moveCount,
    watchProcesses,
    info,
    error,
    clear,
  };
});
