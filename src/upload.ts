import { recursiveFileList, add_to_queue, isSingleGamePgn, isMultiGamePgn } from './utils';

export async function upload_gamespgn_file_if_exists(roundId: string, path: string) {
  const files = await recursiveFileList(path);
  await add_to_queue(
    roundId,
    files.filter(file => isMultiGamePgn(file)),
  );
}

export async function uploadExistingFilesInFolder(roundId: string, path: string) {
  const files = await recursiveFileList(path);
  await add_to_queue(
    roundId,
    files.filter(file => isSingleGamePgn(file)),
  );
}
