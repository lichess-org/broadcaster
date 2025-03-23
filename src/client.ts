import createClient, { Middleware } from 'openapi-fetch';
import { paths } from '@lichess-org/types';
import { fetch } from '@tauri-apps/plugin-http';

import { useSettingsStore } from './stores/settings';
import { useUserStore } from './stores/user';
import { useLogStore } from './stores/logs';
import { getName, getVersion } from '@tauri-apps/api/app';

export const uaPrefix = async () => {
  let appName = await getName();
  let appVersion = await getVersion();
  return `${appName}/${appVersion}`;
}

export function lichessApiClient() {
  const settings = useSettingsStore();
  const user = useUserStore();
  const logs = useLogStore();

  const client = createClient<paths>({
    fetch,
    baseUrl: settings.lichessUrl,
  });

  const loggingMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set('User-Agent', (await uaPrefix()) + ' as:' + user.username);
      if (user.accessToken) {
        request.headers.set('Authorization', `Bearer ${user.accessToken.access_token}`);
      }
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
