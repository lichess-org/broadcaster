import { recursiveFileList, add_to_queue, isSingleGamePgn, isMultiGamePgn } from './utils';

export async function uploadMultiGameFileIfExists(roundId: string, path: string) {
  const files = await recursiveFileList(path);
  const toUpload = files.filter(file => isMultiGamePgn(file));
  await add_to_queue(roundId, toUpload);
  return toUpload;
}

export async function uploadIndividualGames(roundId: string, path: string) {
  const files = await recursiveFileList(path);
  const toUpload = files.filter(file => isSingleGamePgn(file));
  await add_to_queue(roundId, toUpload);
  return toUpload;
}
