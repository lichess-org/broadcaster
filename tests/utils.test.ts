import { expect, it, vi } from 'vitest';
import { timestampToLocalDatetime, relativeTimeDisplay, delayDisplay, pgnTag, isWrite, sortFiles } from '../src/utils';
import { BroadcastPgnPushTags } from '../src/types';
import { WatchEvent } from '@tauri-apps/plugin-fs';

it('shows localized datetime', () => {
  expect(timestampToLocalDatetime(new Date(2024, 1, 10, 14, 30, 0).getTime(), 'en-US')).toBe(
    'Saturday, 2/10/24, 2:30 PM',
  );
  expect(timestampToLocalDatetime(new Date(2024, 1, 10, 14, 30, 0).getTime(), 'fr-FR')).toBe('samedi 10/02/24 14:30');
});

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

it('computes delay value', () => {
  expect(delayDisplay(1)).toBe('1 second');
  expect(delayDisplay(15)).toBe('15 seconds');
  expect(delayDisplay(75)).toBe('1 minute 15 seconds');
});

it('sorts files', () => {
  const files = ['game-3.pgn', 'game-1.pgn', 'game-2.pgn'];
  expect(sortFiles(files)).toEqual(['game-1.pgn', 'game-2.pgn', 'game-3.pgn']);
});

it('sorts files with multiple digits', () => {
  const files = ['game-1.pgn', 'game-10.pgn', 'game-2.pgn', 'game-20.pgn', 'game-3.pgn'];
  expect(sortFiles(files)).toEqual(['game-1.pgn', 'game-2.pgn', 'game-3.pgn', 'game-10.pgn', 'game-20.pgn']);
});

it('returns a PGN name', () => {
  const tags: BroadcastPgnPushTags = { White: 'Magnus Carlsen' };
  expect(pgnTag('White', tags)).toBe('Magnus Carlsen');
});

it('returns a PGN tag', () => {
  const tags: BroadcastPgnPushTags = { A: '1', B: '2', C: '3' };
  expect(pgnTag('B', tags)).toBe('2');
  expect(pgnTag('D', tags)).toBeUndefined();
});

const events: {
  linux: {
    create: WatchEvent;
    copyFileToFolder: WatchEvent;
    open: WatchEvent;
    close: WatchEvent;
    modify: WatchEvent;
    delete: WatchEvent;
    rename: WatchEvent;
  };
  windows: {
    create: WatchEvent;
    copyFileToFolder: WatchEvent;
    open?: WatchEvent;
    close?: WatchEvent;
    modify: WatchEvent;
    delete: WatchEvent;
    rename: WatchEvent;
  };
  macos: {
    create: WatchEvent;
    copyFileToFolder: WatchEvent;
    open: WatchEvent;
    close?: WatchEvent;
    modify: WatchEvent[];
    delete: WatchEvent;
    rename: WatchEvent;
  };
} = {
  linux: {
    create: { type: { create: { kind: 'file' } }, paths: ['/path/to/file.txt'], attrs: {} },
    copyFileToFolder: {
      type: { modify: { kind: 'rename', mode: 'to' } },
      paths: ['/path/to/game-2.pgn'],
      attrs: { tracker: 174927 },
    },
    open: { type: { access: { kind: 'open', mode: 'any' } }, paths: ['/path/to/file.txt'], attrs: {} },
    close: { type: { access: { kind: 'close', mode: 'write' } }, paths: ['/path/to/file.txt'], attrs: {} },
    modify: { type: { modify: { kind: 'data', mode: 'any' } }, paths: ['/path/to/file.txt'], attrs: {} },
    delete: { type: { remove: { kind: 'file' } }, paths: ['/path/to/e.txt'], attrs: {} },
    rename: {
      type: { modify: { kind: 'rename', mode: 'both' } },
      paths: ['/path/to/old.txt', '/path/to/new.txt'],
      attrs: { tracker: 173726 },
    },
  },
  windows: {
    create: { type: { create: { kind: 'any' } }, paths: ['C:\\path\\to\\new.txt'], attrs: {} },
    copyFileToFolder: { type: { create: { kind: 'any' } }, paths: ['C:\\path\\to\\game-9.pgn'], attrs: {} },
    open: undefined,
    close: undefined,
    modify: { type: { modify: { kind: 'any' } }, paths: ['C:\\path\\to\\games.pgn'], attrs: {} },
    delete: { type: { remove: { kind: 'any' } }, paths: ['C:\\path\\to\\new.txt'], attrs: {} },
    rename: {
      type: { modify: { kind: 'rename', mode: 'both' } },
      paths: ['C:\\path\\to\\old.pgn', 'C:\\path\\to\\new.pgn'],
      attrs: {},
    },
  },
  macos: {
    create: { type: { create: { kind: 'file' } }, paths: ['/path/to/file.txt'], attrs: {} },
    copyFileToFolder: { type: { modify: { kind: 'rename', mode: 'any' } }, paths: ['/path/to/foo.txt'], attrs: {} },
    open: { type: { modify: { kind: 'metadata', mode: 'extended' } }, paths: ['/path/to/foo.txt'], attrs: {} },
    close: undefined,
    modify: [
      // editing a file via TextEditor.app and CLI generate different events
      { type: { modify: { kind: 'rename', mode: 'any' } }, paths: ['/path/to/foo.txt'], attrs: {} },
      { type: { modify: { kind: 'data', mode: 'content' } }, paths: ['/path/to/foo.txt'], attrs: {} },
    ],
    delete: { type: { remove: { kind: 'file' } }, paths: ['/path/to/foo.txt'], attrs: {} },
    rename: {
      type: { modify: { kind: 'rename', mode: 'both' } },
      paths: ['/path/to/old.txt', '/path/to/new.txt'],
      attrs: {},
    },
  },
};

it('includes file modifications', () => {
  expect(isWrite(events.linux.create)).toBe(true);
  expect(isWrite(events.linux.copyFileToFolder)).toBe(true);
  expect(isWrite(events.linux.modify)).toBe(true);
  expect(isWrite(events.linux.rename)).toBe(true);

  expect(isWrite(events.windows.create)).toBe(true);
  expect(isWrite(events.windows.copyFileToFolder)).toBe(true);
  expect(isWrite(events.windows.modify)).toBe(true);
  expect(isWrite(events.windows.rename)).toBe(true);

  expect(isWrite(events.macos.create)).toBe(true);
  expect(isWrite(events.macos.copyFileToFolder)).toBe(true);
  expect(isWrite(events.macos.modify[0])).toBe(true);
  expect(isWrite(events.macos.modify[1])).toBe(true);
  expect(isWrite(events.macos.rename)).toBe(true);
});

it('excludes other fs events', () => {
  expect(isWrite(events.linux.open)).toBe(false);
  expect(isWrite(events.linux.close)).toBe(false);
  expect(isWrite(events.linux.delete)).toBe(false);

  expect(events.windows.open).toBeUndefined();
  expect(events.windows.close).toBeUndefined();
  expect(isWrite(events.windows.delete)).toBe(false);

  expect(isWrite(events.macos.open)).toBe(false);
  expect(events.macos.close).toBeUndefined();
  expect(isWrite(events.macos.delete)).toBe(false);
});
