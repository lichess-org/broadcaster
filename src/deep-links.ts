import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { DeepLink } from './types';
import { router } from './router';

export async function listenForDeepLinks() {
  // check if deep link was requested before the app was started
  await onAppStart();

  // listen for deep links while the app is running
  await onOpenUrl(openDeepLink);
}

async function onAppStart() {
  const startUrls = await getCurrent();

  console.log('startUrls:', startUrls);

  if (startUrls) {
    openDeepLink(startUrls);
  }
}

export function openDeepLink(urls: string[]) {
  urls.forEach(url => {
    const deepLink = parseDeepLink(url);
    console.log('Opening deep link:', deepLink);

    if (deepLink) {
      router.push({
        name: 'round',
        params: {
          id: deepLink.roundId,
        },
      });
    }
  });
}

export function parseDeepLink(url: string): DeepLink | null {
  const regex = /lichess-broadcaster:\/\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  if (match) {
    const [, tourSlug, roundSlug, roundId] = match;
    return { tourSlug, roundSlug, roundId };
  }
  return null;
}
