import { expect, test } from 'vitest';
import { convertLichessUrlToDeepLink, parseDeepLink } from '../src/deep-links';

// from lila's conf/routes:
// GET   /broadcast/by/:user                     controllers.RelayTour.by(user: UserStr, page: Int ?= 1)
// GET   /broadcast/subscribed                   controllers.RelayTour.subscribed(page: Int ?= 1)
// GET   /broadcast/all-private                  controllers.RelayTour.allPrivate(page: Int ?= 1)
// GET   /broadcast/:ts/$id<\w{8}>               controllers.RelayTour.show(ts, id: RelayTourId)
// GET   /broadcast/$tourId<\w{8}>/players       controllers.RelayTour.playersView(tourId: RelayTourId)
// GET   /broadcast/$tourId<\w{8}>/players/:id   controllers.RelayTour.player(tourId: RelayTourId, id:  String)
// GET   /broadcast/:ts/:rs/$roundId<\w{8}>      controllers.RelayRound.show(ts, rs, roundId: RelayRoundId)
// GET   /broadcast/:ts/:rs/$roundId<\w{8}>/$chapterId<\w{8}> controllers.RelayRound.chapter(ts, rs, roundId: RelayRoundId, chapterId: StudyChapterId)
// GET   /broadcast/$roundId<\w{8}>/teams        controllers.RelayRound.teamsView(roundId: RelayRoundId)
test.each([
  { path: String.raw`/broadcast/by/:user` },
  { path: String.raw`/broadcast/subscribed` },
  { path: String.raw`/broadcast/all-private` },
  { path: String.raw`/broadcast/:ts/$id<\w{8}>` },
  { path: String.raw`/broadcast/$tourId<\w{8}>/players` },
  { path: String.raw`/broadcast/$tourId<\w{8}>/players/:id` },
  { path: String.raw`/broadcast/:ts/:rs/$roundId<\w{8}>` },
  { path: String.raw`/broadcast/:ts/:rs/$roundId<\w{8}>/$chapterId<\w{8}>` },
  { path: String.raw`/broadcast/$roundId<\w{8}>/teams` },
])('lila route ($path)', ({ path }) => {
  expect(parseDeepLink(`lichess-broadcaster:/${path}`)).toEqual({
    scheme: 'lichess-broadcaster',
    path,
  });
});

test('basic deep links', () => {
  expect(parseDeepLink('lichess-broadcaster://')).toEqual({
    scheme: 'lichess-broadcaster',
    path: '/',
  });
});

test('invalid deep links', () => {
  expect(() => parseDeepLink('foo')).toThrowError('Invalid deep link: foo');
});

test('convert lichess url to deep link', () => {
  expect(convertLichessUrlToDeepLink('http://localhost:8080/broadcast/suriname-festival/round-2/BEpc6OSp')).toEqual({
    scheme: 'lichess-broadcaster',
    path: '/broadcast/suriname-festival/round-2/BEpc6OSp',
  });

  expect(() => convertLichessUrlToDeepLink('foo')).toThrowError('Invalid URL');
});
