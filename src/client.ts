import createClient from 'openapi-fetch';
import { paths } from '@lichess-org/types';
import { fetch } from '@tauri-apps/plugin-http';

import { useSettingsStore } from './stores/settings';
import { useUserStore } from './stores/user';

export function lichessApiClient(addlHeaders?: Record<string, string>) {
  const settings = useSettingsStore();
  const user = useUserStore();

  const uaPrefix: string = settings.version;

  const headers: HeadersInit = new Headers();
  headers.set('User-Agent', uaPrefix + ' as:' + (user.username ?? 'anon'));

  if (user.accessToken) {
    headers.set('Authorization', `Bearer ${user.accessToken.access_token}`);
  }

  if (addlHeaders) {
    for (const [key, value] of Object.entries(addlHeaders)) {
      headers.set(key, value);
    }
  }

  return createClient<paths>({
    baseUrl: settings.lichessUrl,
    fetch: req => fetch(req, { headers }),
  });
}
