import { invoke } from '@tauri-apps/api/core';
import { DirEntry, readDir } from '@tauri-apps/plugin-fs';
import { useLogStore } from './stores/logs';
import { useSettingsStore } from './stores/settings';
import { useUserStore } from './stores/user';
import { useSystemStore } from './stores/system';
import { BroadcastPgnPushTags } from './types';

export async function lichessFetch(
  path: string,
  params?: Record<string, string>,
  options?: RequestInit,
): Promise<Response> {
  const settings = useSettingsStore();
  const user = useUserStore();

  const url = `${settings.lichessUrl}${path}?${new URLSearchParams(params)}`;
  return fetch(url, {
    headers: new Headers({
      Authorization: `Bearer ${user.accessToken?.access_token}`,
    }),
    ...options,
  })
    .then(response => {
      if (!response.ok) handleFetchError(url, response);
      return response;
    })
    .catch((error: TypeError) => {
      const logs = useLogStore();
      logs.error(`Error: ${error.name} ${error.message} - ${url}`);
      throw error;
    });
}

function handleFetchError(url: string, response: Response) {
  if (response.status === 401) {
    const user = useUserStore();
    user.logout(false);
  } else {
    const logs = useLogStore();
    logs.error(`Error: ${response.status} ${response.statusText} - ${url}`);
  }

  throw new Error(`${response.status} ${response.statusText}`);
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

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('shows localized datetime', () => {
    expect(timestampToLocalDatetime(new Date(2024, 1, 10, 14, 30, 0).getTime(), 'en-US')).toBe(
      'Saturday, 2/10/24, 2:30 PM',
    );
    expect(timestampToLocalDatetime(new Date(2024, 1, 10, 14, 30, 0).getTime(), 'fr-FR')).toBe('samedi 10/02/24 14:30');
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

if (import.meta.vitest) {
  const { it, expect, vi } = import.meta.vitest;

  it('shows relative time', () => {
    vi.setSystemTime(new Date(2000, 1, 1));

    expect(relativeTimeDisplay(new Date(2000, 1, 1, 0, 0, 1).getTime())).toBe('in 1 second');
    expect(relativeTimeDisplay(new Date(2000, 1, 1, 0, 0, 2).getTime())).toBe('in 2 seconds');

    expect(relativeTimeDisplay(new Date(2000, 1, 1, 0, 45, 0).getTime())).toBe('in 45 minutes');
    expect(relativeTimeDisplay(new Date(2000, 1, 1, 1, 0, 0).getTime())).toBe('in 1 hour');

    expect(relativeTimeDisplay(new Date(2000, 1, 3, 0, 0, 0).getTime())).toBe('in 2 days');
    expect(relativeTimeDisplay(new Date(2000, 1, 22, 0, 0, 0).getTime())).toBe('in 3 weeks');

    expect(relativeTimeDisplay(new Date(2000, 1, 2).getTime())).toBe('tomorrow');
    expect(relativeTimeDisplay(new Date(1999, 12, 31).getTime())).toBe('yesterday');

    expect(relativeTimeDisplay(new Date(1999, 12, 15).getTime())).toBe('3 weeks ago');
  });
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

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('computes delay value', () => {
    expect(delayDisplay(1)).toBe('1 second');
    expect(delayDisplay(15)).toBe('15 seconds');
    expect(delayDisplay(75)).toBe('1 minute 15 seconds');
  });
}

export function isSingleGamePgn(path: string): boolean {
  return path.endsWith('.pgn') && !path.endsWith('games.pgn');
}

export function isMultiGamePgn(path: string): boolean {
  return path.endsWith('games.pgn');
}

/**
 * Determine which files to upload.
 * If there is a `games.pgn` file, upload only that.
 * Otherwise, upload the individual game PGNs.
 */
export function multiOrSingleFilter(files: string[]): string[] {
  const multiGamePgn = files.find(isMultiGamePgn);
  if (multiGamePgn) {
    return [multiGamePgn];
  }

  return files.filter(isSingleGamePgn);
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;
  it('finds pgn files', () => {
    expect(isSingleGamePgn('path/to/game-1.pgn')).toBe(true);
    expect(isMultiGamePgn('path/to/game-1.pgn')).toBe(false);

    expect(isSingleGamePgn('path/to/games.pgn')).toBe(false);
    expect(isMultiGamePgn('path/to/games.pgn')).toBe(true);

    expect(isSingleGamePgn('path/to/index.json')).toBe(false);
    expect(isMultiGamePgn('path/to/index.json')).toBe(false);
  });

  describe('multiOrSingleFilter', () => {
    it('only includes games.pgn', () => {
      const files = ['game-1.pgn', 'game-2.pgn', 'games.pgn'];
      expect(multiOrSingleFilter(files)).toEqual(['games.pgn']);
    });

    it('includes all individual games', () => {
      const files = ['game-1.pgn', 'game-2.pgn', 'game-3.pgn'];
      expect(multiOrSingleFilter(files)).toEqual(['game-1.pgn', 'game-2.pgn', 'game-3.pgn']);
    });
  });
}

export async function fileList(folder: string, recursive: boolean = false): Promise<string[]> {
  const files: string[] = [];
  const entries = await readDir(folder);

  const traverse = async (entries: DirEntry[]) => {
    for (const entry of entries) {
      if (entry.isDirectory && recursive) {
        traverse(await readDir(entry.name));
      } else {
        files.push(entry.name);
      }
    }
  };

  traverse(entries);

  return files.reverse();
}

/**
 * Add a PGN push to the queue, which will be handled in Rust by the backend.
 */
export async function add_to_queue(roundId: string, files: string[]) {
  const settings = useSettingsStore();
  const system = useSystemStore();
  const user = useUserStore();

  const url = `${settings.lichessUrl}/api/broadcast/round/${roundId}/push`;

  await invoke('add_to_queue', {
    files,
    url,
    apiToken: user.accessToken?.access_token,
    userAgent: `${system.uaPrefix()} as:${user.username?.toLowerCase() ?? 'anon'}`,
  });
}

export function pgnTag(tag: string, tags: BroadcastPgnPushTags): string | undefined {
  return tags[tag];
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it('returns a PGN name', () => {
    const tags: BroadcastPgnPushTags = { White: 'Magnus Carlsen' };
    expect(pgnTag('White', tags)).toBe('Magnus Carlsen');
  });

  it('returns a PGN tag', () => {
    const tags: BroadcastPgnPushTags = { A: '1', B: '2', C: '3' };
    expect(pgnTag('B', tags)).toBe('2');
    expect(pgnTag('D', tags)).toBeUndefined();
  });
}
