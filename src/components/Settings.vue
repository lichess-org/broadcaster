<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings";
import { getVersion } from "@tauri-apps/api/app";
import { useUserStore } from "../stores/user";
import { openBrowser } from "../utils";

const settings = useSettingsStore()
const user = useUserStore()

const appVersion = ref('')
getVersion().then((version) => {
  appVersion.value = version
})

const form = ref<{ lichessUrl: string }>({
  lichessUrl: settings.lichessUrl,
})

async function save() {
  settings.setLichessUrl(form.value.lichessUrl)
  form.value.lichessUrl = settings.lichessUrl
}
</script>

<template>
  <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">Settings</h2>

  <div class="divide-y divide-white/5">
    <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 class="text-base font-semibold leading-7 text-white">Advanced</h2>
        <p class="mt-1 text-sm leading-6 text-gray-400">For development purposes</p>
      </div>

      <form class="md:col-span-2" @submit.prevent="save">
        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div class="col-span-full">
            <label for="lichessUrl" class="block text-sm font-medium leading-6 text-white">Lichess URL</label>
            <div class="mt-2">
              <div
                class="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                <input type="text" id="lichessUrl" autocomplete="false"
                  class="flex-1 border-0 bg-transparent py-1.5 px-2 text-white focus:ring-0 sm:text-sm sm:leading-6"
                  v-model="form.lichessUrl">
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 flex">
          <button type="submit"
            class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Save</button>
        </div>
      </form>
    </div>

    <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8"
      v-if="user.isLoggedIn()">
      <div>
        <h2 class="text-base font-semibold leading-7 text-white">Session</h2>
      </div>

      <div>
        <p class="mb-2 text-sm leading-6 text-gray-400">You are logged in as <strong>{{ user.username }}</strong></p>
        <form class="flex items-start md:col-span-2" @submit.prevent="user.logout()">
          <button type="submit"
            class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400">Logout</button>
        </form>
      </div>
    </div>

    <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 class="text-base font-semibold leading-7 text-white">About</h2>
      </div>

      <div class="md:col-span-2">
        <p class="mb-2 text-sm leading-6 text-gray-400">
          You are using version v<strong>{{ appVersion }}</strong>
        </p>
        <p class="mb-2 text-sm leading-6 text-gray-400">
          See the source and contribute to this
          <a href="#" class="underline" @click.prevent="openBrowser('https://github.com/fitztrev/pgn-broadcaster')">app on
            GitHub</a>
        </p>
        <p class="mb-2 text-sm leading-6 text-gray-400">
          If you're having trouble with your broadcast, please
          <a href="#" class="underline"
            @click.prevent="openBrowser('https://discord.com/channels/1094189632691904573/1122545040686858340')">
            post to <code>#broadcast-errors</code> on the Lichess Content Discord</a>.
        </p>
      </div>
    </div>
  </div>
</template>
