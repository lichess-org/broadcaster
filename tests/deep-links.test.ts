import { expect, test } from 'vitest';
import { parseDeepLink } from '../src/deep-links';

test.each([
  {
    url: '/broadcast/by/:user',
    expected: { scheme: 'lichess-broadcaster', route: 'RelayTour.by', username: ':user' },
  },
  { url: '/broadcast/subscribed', expected: { scheme: 'lichess-broadcaster', route: 'RelayTour.subscribed' } },
  { url: '/broadcast/all-private', expected: { scheme: 'lichess-broadcaster', route: 'RelayTour.allPrivate' } },
  {
    url: '/broadcast/:ts/$id<\w{8}>',
    expected: { scheme: 'lichess-broadcaster', route: 'RelayTour.show', tourSlug: ':ts', tourId: '$id%3Cw%7B8%7D%3E' },
  },
  {
    url: '/broadcast/$tourId<\w{8}>/players',
    expected: {
      scheme: 'lichess-broadcaster',
      route: 'RelayTour.playersView',
      tourId: '$tourId%3Cw%7B8%7D%3E',
    },
  },
  {
    url: '/broadcast/$tourId<\w{8}>/players/:id',
    expected: {
      scheme: 'lichess-broadcaster',
      route: 'RelayTour.player',
      tourId: '$tourId%3Cw%7B8%7D%3E',
      player: ':id',
    },
  },
  {
    url: '/broadcast/:ts/:rs/$roundId<\w{8}>',
    expected: {
      scheme: 'lichess-broadcaster',
      route: 'RelayRound.show',
      tourSlug: ':ts',
      roundSlug: ':rs',
      roundId: '$roundId%3Cw%7B8%7D%3E',
    },
  },
  {
    url: '/broadcast/:ts/:rs/$roundId<\w{8}>/$chapterId<\w{8}>',
    expected: {
      scheme: 'lichess-broadcaster',
      route: 'RelayTour.player',
      tourSlug: ':ts',
      roundSlug: ':rs',
      roundId: '$roundId%3Cw%7B8%7D%3E',
      chapterId: '$chapterId%3Cw%7B8%7D%3E',
    },
  },
  {
    url: '/broadcast/$roundId<\w{8}>/teams',
    expected: {
      route: 'RelayTour.show',
      scheme: 'lichess-broadcaster',
      tourId: 'teams',
      tourSlug: '$roundId%3Cw%7B8%7D%3E',
    },
  },
])('lila route ($url)', ({ url, expected }) => {
  expect(parseDeepLink(`lichess-broadcaster:/${url}`)).toEqual(expected);
});

test('basic deep links', () => {
  expect(parseDeepLink('lichess-broadcaster://')).toEqual({
    scheme: 'lichess-broadcaster',
    route: 'Home',
  });
});

test('invalid deep links', () => {
  expect(() => parseDeepLink('foo')).toThrowError('Invalid deep link: foo');
});
