import { fileList, isSingleGamePgn, isMultiGamePgn } from './utils';

export async function getMultiGamePgns(path: string) {
  const files = await fileList(path, true);
  return files.filter(file => isMultiGamePgn(file));
}

export async function getIndividualGamePgns(path: string) {
  const files = await fileList(path, true);
  return files.filter(file => isSingleGamePgn(file));
}
