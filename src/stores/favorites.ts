import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import Database from '@tauri-apps/plugin-sql';
import { useUserStore } from './user';

type SidebarUser = { label: string; username: string };

export type PinnedBroadcast = {
  id: string;
  name: string;
};

export const useFavoritesStore = defineStore('favorites', () => {
  let dbPromise: Promise<Database> | null = null;

  const users = ref<string[]>([]);
  const pinnedBroadcasts = ref<PinnedBroadcast[]>([]);
  const favoritesChangeCounter = ref(0);

  async function getDb(): Promise<Database> {
    if (!dbPromise) {
      dbPromise = Database.load('sqlite:lichess-broadcaster.db');
    }
    return dbPromise;
  }

  async function loadUsers(): Promise<void> {
    const database = await getDb();
    const rows = await database.select<Array<{ username: string }>>(
      'SELECT username FROM pinned_users ORDER BY created_at ASC',
      [],
    );
    users.value = rows.map(row => row.username);
  }

  async function loadPinnedBroadcasts(): Promise<void> {
    const database = await getDb();
    const rows = await database.select<Array<{ id: string; name: string }>>(
      'SELECT id, name FROM pinned_broadcasts ORDER BY created_at ASC',
      [],
    );
    pinnedBroadcasts.value = rows.map(row => ({ id: row.id, name: row.name }));
  }

  function add(user: string): void {
    if (users.value.includes(user)) return;
    users.value.push(user);
    favoritesChangeCounter.value++;

    getDb()
      .then(db => {
        db.execute('INSERT INTO pinned_users (username, created_at) VALUES ($1, $2) ON CONFLICT(username) DO NOTHING', [
          user,
          Date.now(),
        ]);
      })
      .catch(err => console.error('Failed to add user:', err));
  }

  function remove(user: string): void {
    users.value = users.value.filter(u => u !== user);
    favoritesChangeCounter.value++;

    getDb()
      .then(db => {
        db.execute('DELETE FROM pinned_users WHERE username = $1', [user]);
      })
      .catch(err => console.error('Failed to remove user:', err));
  }

  function pinBroadcast(id: string, name: string): void {
    if (pinnedBroadcasts.value.some(b => b.id === id)) return;
    pinnedBroadcasts.value.push({ id, name });
    favoritesChangeCounter.value++;

    getDb()
      .then(db => {
        db.execute(
          'INSERT INTO pinned_broadcasts (id, name, created_at) VALUES ($1, $2, $3) ON CONFLICT(id) DO UPDATE SET name = $2',
          [id, name, Date.now()],
        );
      })
      .catch(err => console.error('Failed to pin broadcast:', err));
  }

  function unpinBroadcast(id: string): void {
    pinnedBroadcasts.value = pinnedBroadcasts.value.filter(b => b.id !== id);
    favoritesChangeCounter.value++;

    getDb()
      .then(db => {
        db.execute('DELETE FROM pinned_broadcasts WHERE id = $1', [id]);
      })
      .catch(err => console.error('Failed to unpin broadcast:', err));
  }

  function isBroadcastPinned(id: string): boolean {
    return pinnedBroadcasts.value.some(b => b.id === id);
  }

  const sidebar = computed<SidebarUser[]>(() => {
    let sidebarUsers: SidebarUser[] = [];

    const user = useUserStore();
    if (user.username) {
      sidebarUsers.push({ label: user.username, username: user.username });
    }

    sidebarUsers.push({ label: 'Featured', username: 'broadcaster' });
    sidebarUsers = sidebarUsers.concat(users.value.map(username => ({ label: username, username })));

    return sidebarUsers;
  });

  // Initialize data on store creation
  Promise.all([loadUsers(), loadPinnedBroadcasts()]).catch(err => {
    console.error('Failed to load favorites:', err);
  });

  return {
    users,
    pinnedBroadcasts,
    favoritesChangeCounter,
    add,
    remove,
    pinBroadcast,
    unpinBroadcast,
    isBroadcastPinned,
    sidebar,
  };
});
