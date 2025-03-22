import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { lichessApiClient } from './client';
import { join, sep } from '@tauri-apps/api/path';
import { BroadcastPgnPushTags } from './types';

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

export async function uploadFolderToRound(roundId: string, folder: string) {
  const files = await fileList(folder, true);

  const toUpload = filesToUpload(files);

  await Promise.all(toUpload.map(async file => await readTextFile(file))).then(async body => {
    await pushPgnToRound(roundId, body.join('\n\n'));
  });
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

export function pgnTag(tag: string, tags: BroadcastPgnPushTags): string | undefined {
  return tags[tag];
}
