<script setup lang="ts">
import { start, onUrl } from '@fabianlars/tauri-plugin-oauth';
import pkceChallenge from 'pkce-challenge';
import { useSettingsStore } from '../stores/settings';
import { appName } from '../client';
import { operations } from '@lichess-org/types';
import { lichessApiClient } from '../client';
import { useUserStore } from '../stores/user';
import { openUrl } from '@tauri-apps/plugin-opener';

const settings = useSettingsStore();
const user = useUserStore();

async function login() {
  try {
    const port = await start();

    const clientId = await appName();
    const redirectUri = `http://localhost:${port}`;
    const challenge = await pkceChallenge(128);

    let qs: operations['oauth']['parameters']['query'] = {
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: challenge.code_challenge,
      scope: ['study:read', 'study:write'].join(' '),
    };

    const url = new URL(settings.lichessUrl);
    url.pathname = '/oauth';
    url.search = new URLSearchParams(qs).toString();
    const urlToOpen = url.toString();

    await openUrl(urlToOpen);

    await onUrl(url => {
      const receivedUrl = URL.parse(url);
      const code = receivedUrl?.searchParams.get('code');

      if (!code) {
        throw new Error('No code received in OAuth callback');
      }

      lichessApiClient()
        .POST('/api/token', {
          body: {
            grant_type: 'authorization_code',
            code,
            code_verifier: challenge.code_verifier,
            redirect_uri: redirectUri,
            client_id: clientId,
          },
        })
        .then(response => {
          if (response.data) {
            user.setAccessToken(response.data);
          }
        })
        .catch(error => {
          console.error('Error fetching token:', error);
        });
    });
  } catch (error) {
    console.error('Error starting OAuth server:', error);
  }
}
</script>

<template>
  <div class="text-center mt-20">
    <h3 class="mt-2 text-xl font-semibold text-gray-200">Welcome to the Lichess Broadcaster app</h3>
    <p class="mt-1 text-sm text-gray-300">Get started by logging in with your Lichess account.</p>
    <div class="mt-6">
      <button
        type="button"
        @click="login"
        class="inline-flex items-center rounded-md bg-indigo-600 px-8 py-3 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="-ml-0.5 mr-1.5 h-5 w-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>

        Log in with Lichess
      </button>
    </div>
  </div>
</template>
