import { recursiveFileList, add_to_queue, isSingleGamePgn } from './utils';

export async function upload_gamespgn_file_if_exists(roundId: string, path: string) {
  const files = await recursiveFileList(path);
  const gamespgn = files.find(file => file.endsWith('games.pgn'));

  if (gamespgn) {
    await add_to_queue(roundId, [gamespgn]);
  }
}

export async function uploadExistingFilesInFolder(roundId: string, path: string) {
  let files = await recursiveFileList(path);
  files = files.filter(file => isSingleGamePgn(file));

  await add_to_queue(roundId, files);
}
