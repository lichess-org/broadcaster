import { WatchEvent } from '@tauri-apps/plugin-fs';

export function isWrite(event: WatchEvent): boolean {
  if (typeof event.type === 'string') return false;
  if ('modify' in event.type && event.type.modify.kind === 'metadata') return false;
  if ('access' in event.type && event.type.access.kind === 'close') return false;

  return (
    'create' in event.type ||
    'modify' in event.type ||
    ('access' in event.type && 'mode' in event.type.access && event.type.access.mode === 'write')
  );
}
