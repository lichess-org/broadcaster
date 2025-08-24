import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { lichessApiClient } from './client';
import { join, sep } from '@tauri-apps/api/path';
import { BroadcastPgnPushTags } from './types';
import { useLogStore } from './stores/logs';

export const isPgnFile = (path: string): boolean => path.endsWith('.pgn');
export const isMultiGamePgn = (path: string): boolean => path.endsWith(`${sep()}games.pgn`);

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

  return files;
}

export function sortFiles(files: string[]): string[] {
  const gameId = (file: string) => parseInt(file.match(/\d+/)?.[0] ?? '0');
  return files.sort((a, b) => gameId(a) - gameId(b));
}

export function filesToUpload(files: string[]): string[] {
  const multiGamePgn = files.find(isMultiGamePgn);

  if (multiGamePgn) {
    return [multiGamePgn];
  } else {
    return sortFiles(files.filter(isPgnFile));
  }
}

export async function uploadFolderToRound(roundId: string, folder: string): Promise<void> {
  const files = await fileList(folder, true);

  const toUpload = filesToUpload(files);

  await Promise.all(toUpload.map(async file => await readTextFile(file))).then(async body => {
    await pushPgnToRound(roundId, body.join('\n\n'));
  });
}

async function pushPgnToRound(roundId: string, pgn: string): Promise<void> {
  const logs = useLogStore();

  const pushResponse = await lichessApiClient().POST('/api/broadcast/round/{broadcastRoundId}/push', {
    params: { path: { broadcastRoundId: roundId } },
    headers: {
      'Content-Type': 'text/plain',
    },
    body: pgn,
    bodySerializer: body => body,
  });

  const successes: {
    games: number;
    moves: number;
  } = { games: 0, moves: 0 };
  const errors: string[] = [];

  pushResponse.data?.games.forEach(game => {
    const gameName = `[Round ${pgnTag('Round', game.tags)}] ${pgnTag('White', game.tags)} vs ${pgnTag('Black', game.tags)}`;
    if (game.error) {
      errors.push(`${gameName}: ${game.error}`);
    } else if (game.moves && game.moves > 0) {
      successes.games += 1;
      successes.moves += game.moves;
    }
  });

  if (errors.length) {
    logs.error(`Errors: ${errors.join(', ')}`);
  }
  if (successes.games > 0) {
    logs.info(`Success: ${successes.games} games, ${successes.moves} moves`);
  }
}

export function pgnTag(tag: string, tags: BroadcastPgnPushTags): string {
  return tags[tag] ?? `<${tag}>`;
}
