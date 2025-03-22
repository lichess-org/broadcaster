import { expect, it } from 'vitest';
import { WatchEvent } from '@tauri-apps/plugin-fs';
import { isWrite } from '../src/utils';

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
