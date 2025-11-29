<script setup lang="ts">
import { useUserStore } from './stores/user';
import { requestNotificationPermission } from './notify';
import { useFavoritesStore } from './stores/favorites';
import { RouteNames } from './router';
import { useSettingsStore } from './stores/settings';
import { checkForUpdates } from './updater';

const user = useUserStore();
const favorites = useFavoritesStore();
const settings = useSettingsStore();

settings.setVersion();

if (user.isLoggedIn()) {
  user.validateToken();
}

requestNotificationPermission();
</script>

<template>
  <div>
    <div class="fixed inset-y-0 z-50 flex w-72 flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center">
          <img class="h-8" src="./assets/lichess-white.svg" alt="Lichess logo" />
        </div>
        <nav class="flex flex-1 flex-col">
          <ul class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul class="-mx-2 space-y-1">
                <li>
                  <!-- Current: "bg-gray-800 text-white", Default: "text-gray-400 hover:text-white hover:bg-gray-800" -->
                  <router-link
                    :to="{ name: RouteNames.Home.toString() }"
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:text-white hover:bg-gray-800"
                    active-class="bg-gray-800 text-white"
                  >
                    <svg
                      class="h-6 w-6 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                    Dashboard
                  </router-link>

                  <router-link
                    v-if="user.isLoggedIn()"
                    :to="{ name: RouteNames.FindBroadcast.toString() }"
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:text-white hover:bg-gray-800"
                    active-class="bg-gray-800 text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                    Find a Broadcast
                  </router-link>
                </li>
              </ul>
            </li>
            <li v-if="user.isLoggedIn() && favorites.pinnedBroadcasts.length > 0">
              <div class="text-xs font-semibold leading-6 text-gray-400">Pinned</div>
              <ul class="-mx-2 mt-2 space-y-1">
                <li v-for="broadcast in favorites.pinnedBroadcasts" :key="broadcast.id">
                  <router-link
                    :to="{
                      name: RouteNames['RelayTour.show'].toString(),
                      params: {
                        id: broadcast.id,
                      },
                    }"
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                    active-class="bg-gray-800 text-white"
                  >
                    <span class="inline-flex h-6 w-6 items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        class="w-4 h-4 text-yellow-400"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M2 4.25A2.25 2.25 0 0 1 4.25 2h7.5A2.25 2.25 0 0 1 14 4.25v10a.75.75 0 0 1-1.106.66l-4.394-2.466-4.394 2.466A.75.75 0 0 1 2 14.25v-10Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                    <span class="truncate">
                      {{ broadcast.name }}
                    </span>
                  </router-link>
                </li>
              </ul>
            </li>
            <li v-if="user.isLoggedIn()">
              <div class="text-xs font-semibold leading-6 text-gray-400">Broadcasts</div>
              <ul class="-mx-2 mt-2 space-y-1">
                <li v-for="u in favorites.sidebar">
                  <!-- Current: "bg-gray-800 text-white", Default: "text-gray-400 hover:text-white hover:bg-gray-800" -->
                  <router-link
                    :to="{
                      name: RouteNames['RelayTour.by'].toString(),
                      params: {
                        user: u.username,
                      },
                    }"
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                    active-class="bg-gray-800 text-white"
                  >
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-500">
                      <img
                        v-if="user.username === 'broadcaster'"
                        src="./assets/lichess-white.svg"
                        class="w-3 inline-block"
                        alt="Lichess logo"
                      />
                      <span v-else class="text-xs font-medium leading-none text-white">{{
                        u.label.substring(0, 1).toUpperCase()
                      }}</span>
                    </span>
                    <span class="truncate">{{ u.label }}</span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    :to="{ name: RouteNames.Settings.toString() }"
                    class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <span class="truncate">+ Add</span>
                  </router-link>
                </li>
              </ul>
            </li>
            <li v-if="settings.updateAvailable" class="mt-auto">
              <button
                type="button"
                @click="checkForUpdates"
                class="w-full group flex flex-col gap-y-1 rounded-md p-3 text-sm bg-blue-900/50 border border-blue-700 cursor-pointer hover:bg-blue-900/70 hover:border-blue-600 transition-colors"
                title="Click to install update"
              >
                <div class="flex items-center gap-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-5 w-5 text-blue-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  <span class="font-semibold text-blue-300">Update Available</span>
                </div>
                <p class="text-xs text-gray-300 text-left">
                  Version {{ settings.updateAvailable.version }} is ready to install
                </p>
              </button>
            </li>
            <li :class="{ 'mt-auto': !settings.updateAvailable }">
              <router-link
                :to="{ name: RouteNames.Settings.toString() }"
                class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:text-white hover:bg-gray-800"
                active-class="bg-gray-800 text-white"
              >
                <svg
                  class="h-6 w-6 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="pl-72">
      <main class="py-10">
        <div class="px-4 sm:px-6 lg:px-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>
