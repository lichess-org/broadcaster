import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { DeepLink } from './types';
import { router } from './router';

export async function listenForDeepLinks() {
  // check if deep link was requested before the app was started
  await onAppStart();

  // listen for deep links while the app is running
  await onOpenUrl(urls => openDeepLink(urls.map(parseDeepLink)));
}

async function onAppStart() {
  const startUrls = await getCurrent();

  if (startUrls) {
    openDeepLink(startUrls.map(parseDeepLink));
  }
}

export function convertLichessUrlToDeepLink(url: string): DeepLink {
  const parsedUrl = new URL(url);

  return {
    scheme: 'lichess-broadcaster',
    path: parsedUrl.pathname,
  };
}

export function openDeepLink(links: DeepLink[]) {
  for (const link of links) {
    console.log('Opening deep link:', link);
    router.push(link.path);
  }
}

export function parseDeepLink(url: string): DeepLink {
  const [scheme, path] = url.split(':/', 2);

  if (!scheme || !path) {
    throw new Error(`Invalid deep link: ${url}`);
  }

  return { scheme, path };
}
