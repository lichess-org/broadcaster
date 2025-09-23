import createClient, { HeadersOptions } from 'openapi-fetch';
import { paths } from '@lichess-org/types';
import { fetch } from '@tauri-apps/plugin-http';

import { useSettingsStore } from './stores/settings';
import { useUserStore } from './stores/user';

export function lichessApiClient() {
  const settings = useSettingsStore();
  const user = useUserStore();

  const uaPrefix: string = settings.version;

  const headers: HeadersOptions = {
    'User-Agent': uaPrefix + ' as:' + (user.username ?? 'anon'),
  };

  if (user.accessToken) {
    headers['Authorization'] = `Bearer ${user.accessToken.access_token}`;
  }

  const client = createClient<paths>({
    fetch,
    baseUrl: settings.lichessUrl,
    headers,
  });

  return client;
}
