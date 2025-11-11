import { defineStore } from 'pinia';
import { useUserStore } from './user';

type SidebarUser = { label: string; username: string };

export type PinnedRound = {
  id: string;
  name: string;
  tournamentId: string;
  tournamentName: string;
};

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    users: [] as string[],
    pinnedRounds: [] as PinnedRound[],
  }),
  actions: {
    add(user: string) {
      if (this.users.includes(user)) return;
      this.users.push(user);
    },
    remove(user: string) {
      this.users = this.users.filter(u => u !== user);
    },
    pinRound(id: string, name: string, tournamentId: string, tournamentName: string) {
      if (this.pinnedRounds.some(r => r.id === id)) return;
      this.pinnedRounds.push({ id, name, tournamentId, tournamentName });
    },
    unpinRound(id: string) {
      this.pinnedRounds = this.pinnedRounds.filter(r => r.id !== id);
    },
    isRoundPinned(id: string): boolean {
      return this.pinnedRounds.some(r => r.id === id);
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
