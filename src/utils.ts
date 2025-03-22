import { invoke } from '@tauri-apps/api/core';
import { WatchEvent } from '@tauri-apps/plugin-fs';

export async function openPath(path: string) {
  await invoke('open_path', { path });
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
