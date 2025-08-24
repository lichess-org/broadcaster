import { beforeAll, describe, expect, it } from 'vitest';
import { pgnTag, sortFiles, isMultiGamePgn, fileList, filesToUpload } from '../src/upload';
import { mockIPC } from '@tauri-apps/api/mocks';
import { DirEntry } from '@tauri-apps/plugin-fs';
import { BroadcastPgnPushTags } from '../src/types';

beforeAll(() => {
  Object.defineProperty(window, '__TAURI_INTERNALS__', {
    value: {
      plugins: {
        path: {
          sep: '/',
        },
      },
    },
    writable: true,
  });
});

describe('filters files to upload', () => {
  it('returns a single multi-game PGN', () => {
    expect(filesToUpload(['/path/to/games.pgn', '/path/to/game-1.pgn'])).toEqual(['/path/to/games.pgn']);
  });

  it('returns a list of PGN files', () => {
    expect(
      filesToUpload(['/path/to/game-1.pgn', '/path/to/game-2.pgn', '/path/to/game-3.pgn', '/path/to/image.jpg']),
    ).toEqual(['/path/to/game-1.pgn', '/path/to/game-2.pgn', '/path/to/game-3.pgn']);
  });
});

it('lists files', async () => {
  mockIPC((cmd, payload) => {
    if (cmd === 'plugin:path|join') {
      return (payload as Record<string, string[]>).paths.join('/');
    } else if (cmd === 'plugin:fs|read_dir') {
      return Promise.resolve<DirEntry[]>([
        {
          name: 'game-1.pgn',
          isDirectory: false,
          isFile: true,
          isSymlink: false,
        },
        {
          name: 'game-2.pgn',
          isDirectory: false,
          isFile: true,
          isSymlink: false,
        },
        {
          name: 'game-3.pgn',
          isDirectory: false,
          isFile: true,
          isSymlink: false,
        },
      ]);
    }
    throw new Error(`Unexpected IPC call: ${cmd}`);
  });

  const files = await fileList('/path/to/round');
  expect(files).toEqual(['/path/to/round/game-1.pgn', '/path/to/round/game-2.pgn', '/path/to/round/game-3.pgn']);
});

it('detects multi-game pgn', () => {
  expect(isMultiGamePgn('games.pgn')).toBe(true);
  expect(isMultiGamePgn('/games.pgn')).toBe(true);
  expect(isMultiGamePgn('/path/to/games.pgn')).toBe(true);
  expect(isMultiGamePgn('/path/to/game-1.pgn')).toBe(false);
});

it('sorts files', () => {
  const files = ['game-3.pgn', 'game-1.pgn', 'game-2.pgn'];
  expect(sortFiles(files)).toEqual(['game-1.pgn', 'game-2.pgn', 'game-3.pgn']);
});

it('sorts files with multiple digits', () => {
  const files = ['game-1.pgn', 'game-10.pgn', 'game-11.pgn', 'game-2.pgn', 'game-20.pgn', 'game-3.pgn'];
  expect(sortFiles(files)).toEqual([
    'game-1.pgn',
    'game-2.pgn',
    'game-3.pgn',
    'game-10.pgn',
    'game-11.pgn',
    'game-20.pgn',
  ]);
});

it('returns a PGN name', () => {
  const tags: BroadcastPgnPushTags = { White: 'Magnus Carlsen' };
  expect(pgnTag('White', tags)).toBe('Magnus Carlsen');
});

it('returns a PGN tag', () => {
  const tags: BroadcastPgnPushTags = { A: '1', B: '2', C: '3' };
  expect(pgnTag('B', tags)).toBe('2');
  expect(pgnTag('D', tags)).toBe('<D>');
});
