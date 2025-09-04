import { expect, test } from 'vitest';
import { parseDeepLink } from '../src/deep-links';

test('deep link parsing', () => {
  expect(parseDeepLink('lichess-broadcaster://tournament/round/1')).toEqual({
    tourSlug: 'tournament',
    roundSlug: 'round',
    roundId: '1',
  });

  expect(parseDeepLink('lichess-broadcaster://fide-grand-swiss-2025--open/round-1/xSCoiNg0')).toEqual({
    tourSlug: 'fide-grand-swiss-2025--open',
    roundSlug: 'round-1',
    roundId: 'xSCoiNg0',
  });

  expect(parseDeepLink('foo')).toBeNull();
});
