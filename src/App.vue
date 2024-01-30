<script setup lang="ts">
import { useUserStore } from './stores/user';
import { listen } from '@tauri-apps/api/event';
import { AccessTokenResponse, PgnPushResult } from './types';
import { useLogStore } from './stores/logs';
import { requestNotificationPermission } from './notify';
import { pgnTag } from './utils';

const logs = useLogStore();
const user = useUserStore();

listen<AccessTokenResponse>('event::update_access_token', event => {
  logs.clear();
  user.setAccessToken(event.payload);
});

listen<number>('event::queue_size', event => {
  logs.queueSize = event.payload;
});

listen<PgnPushResult>('event::upload_success', event => {
  // logs.moveCount += event.payload.response.moves;

  event.payload.files.forEach(file => {
    logs.files.add(file);
  });

  logs.info(`Uploaded ${event.payload.files.join(', ')}`);

  const errors = event.payload.response.games.filter(game => game.error);
  errors.forEach(game => {
    logs.error(`PGN Error: ${game.error} in ${pgnTag('White', game.tags)} vs ${pgnTag('Black', game.tags)}`);
  });
});

listen<string>('event::upload_error', event => {
  logs.error(event.payload);
});

if (user.isLoggedIn()) {
  user.validateToken();
}

requestNotificationPermission();
</script>

<template>
  <header class="mb-12 flex">
    <router-link to="/">
      <img src="./assets/lichess-white.svg" class="w-12 inline-block" alt="Lichess logo" />
    </router-link>

    <div class="grow">
      <nav class="flex space-x-4 justify-end">
        <router-link to="/" class="nav-item" active-class="active"> Home </router-link>

        <router-link to="/broadcasts" class="nav-item" active-class="active" v-if="user.isLoggedIn()">
          Broadcasts
        </router-link>

        <router-link to="/settings" class="nav-item" active-class="active"> Settings </router-link>
      </nav>
    </div>
  </header>

  <router-view />
</template>
