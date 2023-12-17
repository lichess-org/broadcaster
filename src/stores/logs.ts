import { defineStore } from "pinia";
import { ref } from "vue";

interface Log {
  date: Date;
  message: string;
}

export const useLogStore = defineStore("logs", () => {
  const logs = ref<Log[]>([]);

  const add = (message: string) => {
    logs.value.push({
      date: new Date(),
      message,
    });
  };

  return {
    logs,
    add,
  };
});
