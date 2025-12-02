import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notify } from '../notify';
import Database from '@tauri-apps/plugin-sql';

enum LogType {
  Info = 'info',
  Error = 'error',
}

export interface Log {
  id: number;
  timestamp: number;
  type: LogType;
  message: string;
  broadcast_tournament_id: string | null;
  round_id: string | null;
  game_id: string | null;
}

interface LogContext {
  broadcastTournamentId?: string;
  roundId?: string;
  gameId?: string;
}

export const useLogStore = defineStore('logs', () => {
  let dbPromise: Promise<Database> | null = null;

  // Trigger for reactivity when logs change
  const logChangeCounter = ref(0);

  async function getDb(): Promise<Database> {
    if (!dbPromise) {
      dbPromise = Database.load('sqlite:lichess-broadcaster.db');
    }
    return dbPromise;
  }

  const add = async (message: string, type: LogType = LogType.Info, context?: LogContext): Promise<void> => {
    const database = await getDb();
    const timestamp = Date.now();

    await database.execute(
      'INSERT INTO logs (timestamp, type, message, broadcast_tournament_id, round_id, game_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        timestamp,
        type,
        message,
        context?.broadcastTournamentId ?? null,
        context?.roundId ?? null,
        context?.gameId ?? null,
      ],
    );

    // Trigger reactivity
    logChangeCounter.value++;
  };

  const info = async (message: string, context?: LogContext): Promise<void> => {
    await add(message, LogType.Info, context);
  };

  const error = async (message: string, context?: LogContext): Promise<void> => {
    await add(message, LogType.Error, context);
    notify('Error', message);
  };

  const getLogs = async (limit: number = 1000): Promise<Log[]> => {
    const database = await getDb();
    const rows = await database.select<Log[]>(
      'SELECT id, timestamp, type, message, broadcast_tournament_id, round_id, game_id FROM logs ORDER BY timestamp DESC LIMIT $1',
      [limit],
    );

    return rows;
  };

  const clear = async (): Promise<void> => {
    const database = await getDb();
    await database.execute('DELETE FROM logs', []);

    // Trigger reactivity
    logChangeCounter.value++;
  };

  return {
    add,
    info,
    error,
    getLogs,
    clear,

    logChangeCounter,
  };
});
