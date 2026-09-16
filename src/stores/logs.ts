import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';
import { notify } from '../notify';

type LogType = 'info' | 'error';
type LogColor = 'white' | 'red' | 'green' | 'blue';

interface Log {
  date: Date;
  type: LogType;
  message: string;
  color: LogColor;
}

export const useLogStore = defineStore('logs', () => {
  const logs = ref<Log[]>([]);
  const files = ref<Set<string>>(new Set());
  const moveCount = ref(0);
  const queueSize = ref(0);

  const add = (message: string, type: LogType = 'info', color: LogColor = 'white') => {
    logs.value.push({
      date: new Date(),
      type,
      message,
      color,
    });
  };

  const info = (message: string, color: LogColor = 'white') => {
    add(message, 'info', color);
  };

  const error = (message: string) => {
    add(message, 'error', 'red');
    notify('Error', message);
  };

  const clear = () => {
    logs.value = [];
  };

  return {
    logs,
    files,
    moveCount,
    queueSize,
    info,
    error,
    clear,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLogStore, import.meta.hot));
}
