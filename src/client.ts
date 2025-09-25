import createClient, { HeadersOptions } from 'openapi-fetch';
import { paths } from '@lichess-org/types';
import { fetch } from '@tauri-apps/plugin-http';

import { useSettingsStore } from './stores/settings';
import { useUserStore } from './stores/user';

export function lichessApiClient() {
  const settings = useSettingsStore();
  const user = useUserStore();

  const uaPrefix: string = settings.version;

  const headers: HeadersInit = new Headers();
  headers.set('User-Agent', uaPrefix + ' as:' + (user.username ?? 'anon'));

  if (user.accessToken) {
    headers.set('Authorization', `Bearer ${user.accessToken.access_token}`);
  }

  const client = createClient<paths>({
    baseUrl: settings.lichessUrl,
    fetch,
    headers,
  });

  return client;
}
