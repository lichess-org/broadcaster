import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { DeepLink } from './types';
import { RouteNames, router } from './router';

export async function listenForDeepLinks() {
  // check if deep link was requested before the app was started
  await onAppStart();

  // listen for deep links while the app is running
  await onOpenUrl(openDeepLink);
}

async function onAppStart() {
  const startUrls = await getCurrent();

  if (startUrls) {
    openDeepLink(startUrls);
  }
}

export function openDeepLink(urls: string[]) {
  urls.forEach(url => {
    const deepLink = parseDeepLink(url);
    console.log('Opening deep link:', deepLink);

    if (deepLink.route === 'RelayRound.show') {
      router.push({
        name: RouteNames['RelayRound.show'].toString(),
        params: {
          id: deepLink.roundId,
        },
      });
    }
  });
}

/**
 * Parse the incoming deep links with the same URL structure as defined in lila's conf/routes
 */
// GET   /broadcast/by/:user                     controllers.RelayTour.by(user: UserStr, page: Int ?= 1)
// GET   /broadcast/subscribed                   controllers.RelayTour.subscribed(page: Int ?= 1)
// GET   /broadcast/all-private                  controllers.RelayTour.allPrivate(page: Int ?= 1)
// GET   /broadcast/:ts/$id<\w{8}>               controllers.RelayTour.show(ts, id: RelayTourId)
// GET   /broadcast/$tourId<\w{8}>/players       controllers.RelayTour.playersView(tourId: RelayTourId)
// GET   /broadcast/$tourId<\w{8}>/players/:id   controllers.RelayTour.player(tourId: RelayTourId, id:  String)
// GET   /broadcast/:ts/:rs/$roundId<\w{8}>      controllers.RelayRound.show(ts, rs, roundId: RelayRoundId)
// GET   /broadcast/:ts/:rs/$roundId<\w{8}>/$chapterId<\w{8}> controllers.RelayRound.chapter(ts, rs, roundId: RelayRoundId, chapterId: StudyChapterId)
// GET   /broadcast/$roundId<\w{8}>/teams        controllers.RelayRound.teamsView(roundId: RelayRoundId)
export function parseDeepLink(url: string): DeepLink {
  let parsed = URL.parse(url);

  if (parsed) {
    const scheme = parsed.protocol.replace(/:$/, '');
    const parts = parsed.pathname.split('/').filter(p => p.length > 0);

    if (parts.length === 0) {
      return {
        scheme,
        route: 'Home',
      };
    }
    if (parts[0] === 'by') {
      return {
        scheme,
        route: 'RelayTour.by',
        username: parts[1],
      };
    } else if (parts[0] === 'subscribed') {
      return {
        scheme,
        route: 'RelayTour.subscribed',
      };
    } else if (parts[0] === 'all-private') {
      return {
        scheme,
        route: 'RelayTour.allPrivate',
      };
    } else if (parts.length === 2 && parts[1] === 'players') {
      return {
        scheme,
        route: 'RelayTour.playersView',
        tourId: parts[0],
      };
    } else if (parts.length === 3 && parts[1] === 'players') {
      return {
        scheme,
        route: 'RelayTour.player',
        tourId: parts[0],
        player: parts[2],
      };
    } else if (parts.length === 2) {
      return {
        scheme,
        route: 'RelayTour.show',
        tourSlug: parts[0],
        tourId: parts[1],
      };
    } else if (parts.length === 3) {
      return {
        scheme,
        route: 'RelayRound.show',
        tourSlug: parts[0],
        roundSlug: parts[1],
        roundId: parts[2],
      };
    } else if (parts.length === 4) {
      return {
        scheme,
        route: 'RelayTour.player',
        tourSlug: parts[0],
        roundSlug: parts[1],
        roundId: parts[2],
        chapterId: parts[3],
      };
    } else if (parts.length === 2 && parts[1] === 'teams') {
      return {
        scheme,
        route: 'RelayRound.teamsView',
        roundId: parts[2],
      };
    }
  }

  throw new Error('Invalid deep link: ' + url);
}
