import { defineStore } from 'pinia';
import { useUserStore } from './user';

type SidebarUser = { label: string; username: string };

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    users: [] as string[],
  }),
  actions: {
    add(user: string) {
      this.users.push(user);
    },
    remove(user: string) {
      this.users = this.users.filter(u => u !== user);
    },
  },
  getters: {
    sidebar(state): SidebarUser[] {
      let users: SidebarUser[] = [];

      const user = useUserStore();
      if (user.username) {
        users.push({ label: user.username, username: user.username });
      }

      users.push({ label: 'Featured', username: 'broadcaster' });
      users = users.concat(state.users.map(username => ({ label: username, username })));

      return users;
    },
  },
  persist: true,
});
