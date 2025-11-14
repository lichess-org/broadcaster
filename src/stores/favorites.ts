import { defineStore } from 'pinia';
import { useUserStore } from './user';

type SidebarUser = { label: string; username: string };

export type PinnedBroadcast = {
  id: string;
  name: string;
};

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    users: [] as string[],
    pinnedBroadcasts: [] as PinnedBroadcast[],
  }),
  actions: {
    add(user: string) {
      if (this.users.includes(user)) return;
      this.users.push(user);
    },
    remove(user: string) {
      this.users = this.users.filter(u => u !== user);
    },
    pinBroadcast(id: string, name: string) {
      if (this.pinnedBroadcasts.some(b => b.id === id)) return;
      this.pinnedBroadcasts.push({ id, name });
    },
    unpinBroadcast(id: string) {
      this.pinnedBroadcasts = this.pinnedBroadcasts.filter(b => b.id !== id);
    },
    isBroadcastPinned(id: string): boolean {
      return this.pinnedBroadcasts.some(b => b.id === id);
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
