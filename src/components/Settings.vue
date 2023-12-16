<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/tauri";
import { useUserStore } from "../stores/user";

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

async function openBrowser(url: string) {
  await invoke("open_browser", { url });
}
</script>

<template>
  <h2 class="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">Settings</h2>

  <div v-if="user.isLoggedIn()" class="text-white">
    Logged in as <strong>{{ user.username }}</strong>

    <span class="ml-2">
      <a href="#" @click="user.logout" class="underline">Logout</a>
    </span>
  </div>

  <form class="flex flex-col space-y-4 my-8">
    <label class="flex flex-col space-y-1">
      <span class="text-white">Lichess URL</span>
      <input type="text" v-model="form.lichessUrl" class="p-1" />
      <div class="text-gray-300 text-sm">Advanced setting. Only change for development.</div>
    </label>

    <button type="button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="save">Save</button>
  </form>

  <h3 class="text-white text-xl">About</h3>
  <p class="text-white">
    You are using version v<strong>{{ appVersion }}</strong>
    <br />
    See the source and contribute to this
    <a href="#" class="underline" @click.prevent="openBrowser('https://github.com/fitztrev/pgn-broadcaster')">app on
      GitHub</a>
  </p>

  <h3 class="text-white text-xl mt-4">Support</h3>
  <p class="text-white">If you're having trouble with your broadcast, please
    <a href="#" class="underline"
      @click.prevent="openBrowser('https://discord.com/channels/1094189632691904573/1122545040686858340')">
      post to <code>#broadcast-errors</code> on the Lichess Content Discord</a>.
  </p>
</template>
