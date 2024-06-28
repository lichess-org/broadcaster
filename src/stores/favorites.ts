import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFavoritesStore = defineStore(
  'favorites',
  () => {
    const users = ref<string[]>([]);

    const add = (user: string) => {
      users.value = [...users.value, user];
    };

    const remove = (user: string) => {
      users.value = users.value.filter(u => u !== user);
    };

    return {
      users,
      add,
      remove,
    };
  },
  {
    persist: true,
  },
);
