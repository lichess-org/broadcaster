<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useUserStore } from '../stores/user';
import AddUserToSidebar from './AddUserToSidebar.vue';
import { invoke } from '@tauri-apps/api/core';
import { openPath } from '@tauri-apps/plugin-opener';
import { toast } from 'vue3-toastify';
import { appDataDir } from '@tauri-apps/api/path';

const settings = useSettingsStore();
const user = useUserStore();

const form = ref<{ lichessUrl: string }>({
  lichessUrl: settings.lichessUrl,
});

const urlError = ref<string>('');

const databaseDir = ref<string>('');
appDataDir().then(dir => {
  databaseDir.value = dir;
});

function validateUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    urlError.value = 'Lichess URL cannot be empty';
    return false;
  }

  try {
    new URL(url);
    urlError.value = '';
    return true;
  } catch {
    urlError.value = 'Please enter a valid URL';
    return false;
  }
}

async function save() {
  if (!validateUrl(form.value.lichessUrl)) {
    toast.error(urlError.value);
    return;
  }

  settings.setLichessUrl(form.value.lichessUrl);
  form.value.lichessUrl = settings.lichessUrl;
  toast.success('Settings updated successfully');
}

function clearAllData() {
  localStorage.clear();
  location.reload();
}

function logout() {
  user.logout();
}

async function openDevTools() {
  await invoke('open_dev_tools');
}
</script>

<template>
  <h2 class="text-gray-400 text-2xl font-bold leading-7 sm:truncate sm:text-3xl sm:tracking-tight">Settings</h2>

  <template v-if="user.isLoggedIn()">
    <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 class="text-gray-400 text-base font-semibold leading-7">Session</h2>
      </div>

      <div>
        <p class="mb-2 text-sm leading-6 text-gray-400">
          You are logged in as <strong>{{ user.username }}</strong>
        </p>
        <form class="flex items-start md:col-span-2" @submit.prevent="logout()">
          <button
            type="submit"
            class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400"
          >
            Logout
          </button>
        </form>
      </div>
    </div>

    <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 class="text-gray-400 text-base font-semibold leading-7">Sidebar</h2>
      </div>
      <div class="md:col-span-2">
        <p class="mb-2 text-sm leading-6 text-gray-400">
          Include broadcasts by other users in the app's sidebar. If you are a contributor to another user's broadcast,
          you can add their username here.
        </p>
        <AddUserToSidebar />
      </div>
    </div>
  </template>

  <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
    <div>
      <h2 class="text-gray-400 text-base font-semibold leading-7">About</h2>
    </div>

    <div class="md:col-span-2">
      <p class="mb-2 text-sm leading-6 text-gray-400">You are using {{ settings.version }}</p>
      <p class="mb-2 text-sm leading-6 text-gray-400">
        See the source and contribute to this
        <a href="#" class="underline" @click.prevent="openPath('https://github.com/lichess-org/broadcaster')"
          >app on GitHub</a
        >
      </p>
      <p class="mb-2 text-sm leading-6 text-gray-400">
        If you're having trouble with your broadcast, please contact
        <a href="#" class="underline" @click.prevent="openPath('mailto:broadcast@lichess.org')"
          >broadcast@lichess.org</a
        >
        or post to <code class="font-bold">#support</code> on the
        <a href="#" class="underline" @click.prevent="openPath('https://discord.gg/Syx9CbN8Jv')">
          Lichess Content Discord</a
        >.
      </p>
      <p class="mb-2 text-sm leading-6 text-gray-400">
        Click here to <a href="#" class="underline" @click.prevent="openDevTools()">open dev tools</a> to check for
        console errors.
      </p>
      <p class="mb-2 text-sm leading-6 text-gray-400">
        This app stores data in a SQLite database in your home directory. You can find it at
        <a href="#" class="underline" @click.prevent="openPath(databaseDir)">{{ databaseDir }}</a
        >.
      </p>
      <div class="mt-8">
        <form class="flex items-start md:col-span-2" @submit.prevent="clearAllData()">
          <button
            type="submit"
            class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-500"
          >
            Reset All Settings
          </button>
        </form>
        <p class="mt-2 text-sm leading-6 text-gray-400">
          Clear all local data and reset app settings to their defaults. This will log you out.
        </p>
      </div>
    </div>
  </div>

  <div class="divide-y divide-white/5">
    <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 class="text-gray-400 text-base font-semibold leading-7">Configuration</h2>
      </div>

      <div class="md:col-span-2">
        <form @submit.prevent="save">
          <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div class="col-span-full">
              <label for="lichessUrl" class="block text-sm font-medium leading-6 text-white">Lichess URL</label>
              <div class="mt-2">
                <div
                  class="flex rounded-md bg-white/5 ring-1 ring-inset focus-within:ring-2 focus-within:ring-inset"
                  :class="
                    urlError ? 'ring-red-500 focus-within:ring-red-500' : 'ring-white/10 focus-within:ring-indigo-500'
                  "
                >
                  <input
                    type="text"
                    id="lichessUrl"
                    autocomplete="off"
                    class="flex-1 border-0 bg-transparent py-1.5 px-2 text-white focus:ring-0 sm:text-sm sm:leading-6"
                    v-model="form.lichessUrl"
                    @blur="validateUrl(form.lichessUrl)"
                    @input="urlError = ''"
                  />
                </div>
                <p v-if="urlError" class="mt-2 text-sm text-red-400">{{ urlError }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 flex">
            <button
              type="submit"
              class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
