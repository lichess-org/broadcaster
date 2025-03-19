import { invoke } from '@tauri-apps/api/core';
import { join } from '@tauri-apps/api/path';
import { readDir, readTextFile, WatchEvent } from '@tauri-apps/plugin-fs';
import { useSettingsStore } from './stores/settings';
import { useUserStore } from './stores/user';
import { useSystemStore } from './stores/system';
import { BroadcastPgnPushTags } from './types';
import createClient, { Middleware } from 'openapi-fetch';
import { paths } from '@lichess-org/types';
import { fetch } from '@tauri-apps/plugin-http';

export async function uploadFolderToRound(roundId: string, folder: string) {
  const files = await fileList(folder, true);

  const multiGamePgn = files.find(isMultiGamePgn);

  const body = multiGamePgn
    ? await readTextFile(multiGamePgn)
    : sortFiles(files)
        .map(file => readTextFile(file))
        .join('\n\n');

  pushPgnToRound(roundId, body);
}

async function pushPgnToRound(roundId: string, pgn: string) {
  const pushResponse = await lichessApiClient().POST('/api/broadcast/round/{broadcastRoundId}/push', {
    params: { path: { broadcastRoundId: roundId } },
    headers: {
      'Content-Type': 'text/plain',
    },
    body: pgn,
    bodySerializer: body => body,
  });

  pushResponse.data?.games.forEach(game => {
    if (game.error) {
      console.error(`PGN Error: ${game.error} in ${pgnTag('White', game.tags)} vs ${pgnTag('Black', game.tags)}`);
    } else {
      console.log(`Uploaded ${game.moves} moves for ${pgnTag('White', game.tags)} vs ${pgnTag('Black', game.tags)}`);
    }
  });

  console.log(pushResponse);
}

export function lichessApiClient() {
  const settings = useSettingsStore();
  const system = useSystemStore();
  const user = useUserStore();

  const client = createClient<paths>({
    fetch,
    baseUrl: settings.lichessUrl,
  });

  const loggingMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set('Authorization', `Bearer ${user.accessToken?.access_token}`);
      request.headers.set('User-Agent', system.uaPrefix() + ' as:' + user.username);
      return request;
    },
    async onError({ error }) {
      console.error(error);
      // wrap errors thrown by fetch
      // onError({ error }) {
      //   return new Error("Oops, fetch failed", { cause: error });
      // },
    },
  };

  client.use(loggingMiddleware);

  return client;
}

export async function openPath(path: string) {
  await invoke('open_path', { path });
}

export function timestampToLocalDatetime(timestamp?: number, locales?: Intl.LocalesArgument) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);

  return date.toLocaleDateString(locales, {
    weekday: 'long',
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

export function relativeTimeDisplay(timestamp?: number) {
  if (!timestamp) {
    return '';
  }

  const then = new Date(timestamp).getTime();
  const deltaSeconds = Math.round((then - Date.now()) / 1000);

  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

export function delayDisplay(delay?: number): string {
  if (!delay) {
    return '';
  }

  return [
    {
      value: Math.floor(delay / 60),
      label: 'minute',
    },
    {
      value: delay % 60,
      label: 'second',
    },
  ]
    .filter(({ value }) => value > 0)
    .map(({ value, label }) => {
      return `${value} ${label}${value > 1 ? 's' : ''}`;
    })
    .join(' ');
}

export function isSingleGamePgn(path: string): boolean {
  return path.endsWith('.pgn') && !path.endsWith('games.pgn');
}

export function isMultiGamePgn(path: string): boolean {
  return path.endsWith('games.pgn');
}

export async function fileList(folder: string, recursive: boolean = false): Promise<string[]> {
  const files: string[] = [];
  const entries = await readDir(folder);

  for (const entry of entries) {
    if (entry.isDirectory && recursive) {
      const subfolder = await join(folder, entry.name);
      files.push(...(await fileList(subfolder, recursive)));
    } else {
      files.push(await join(folder, entry.name));
    }
  }

  return files.reverse();
}

export function sortFiles(files: string[]): string[] {
  const gameId = (file: string) => parseInt(file.match(/\d+/)?.[0] ?? '0');
  return files.sort((a, b) => gameId(a) - gameId(b));
}

export function pgnTag(tag: string, tags: BroadcastPgnPushTags): string | undefined {
  return tags[tag];
}

export function isWrite(event: WatchEvent): boolean {
  const type = event.type;

  if (typeof type === 'string') return false;
  if ('modify' in type && type.modify.kind === 'metadata') return false;
  if ('access' in type && type.access.kind === 'close') return false;

  return (
    'create' in type || 'modify' in type || ('access' in type && 'mode' in type.access && type.access.mode === 'write')
  );
}
