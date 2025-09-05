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

  if (startUrls) {
    openDeepLink(startUrls);
  }
}

export function openDeepLink(urls: string[]) {
  urls.forEach(url => {
    const deepLink = parseDeepLink(url);
    console.log('Opening deep link:', deepLink);
    router.push(deepLink.path);
  });
}

export function parseDeepLink(url: string): DeepLink {
  const [scheme, path] = url.split(':/', 2);

  if (!scheme || !path) {
    throw new Error(`Invalid deep link: ${url}`);
  }

  return { scheme, path };
}
