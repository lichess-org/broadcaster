import createClient, { Middleware } from 'openapi-fetch';
import { paths } from '@lichess-org/types';
import { fetch } from '@tauri-apps/plugin-http';

import { useSettingsStore } from './stores/settings';
import { useUserStore } from './stores/user';
import { useSystemStore } from './stores/system';
import { useLogStore } from './stores/logs';

export function lichessApiClient() {
  const settings = useSettingsStore();
  const system = useSystemStore();
  const user = useUserStore();
  const logs = useLogStore();

  const client = createClient<paths>({
    fetch,
    baseUrl: settings.lichessUrl,
  });

  const loggingMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set('Authorization', `Bearer ${user.accessToken?.access_token}`);
      request.headers.set('User-Agent', system.uaPrefix() + ' as:' + user.username);
      return request;
    },
    async onResponse({ response }) {
      if (response.ok) return;
      logs.error(`Error ${response.status} ${response.statusText} ${response.url}`);
      console.error(response);
    },
    async onError({ error }) {
      console.error(error);
      // wrap errors thrown by fetch
      // onError({ error }) {
      //   return new Error("Oops, fetch failed", { cause: error });
      // },
    },
  };

  client.use(loggingMiddleware);

  return client;
}
