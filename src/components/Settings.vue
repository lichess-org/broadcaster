<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/tauri";

const settings = useSettingsStore()

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
  <h3>Settings</h3>

  <form class="flex flex-col space-y-4">
    <label class="flex flex-col space-y-1">
      <span>Lichess URL</span>
      <input type="text" v-model="form.lichessUrl" />
    </label>

    <button type="button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="save">Save</button>
  </form>

  <h3 class="text-lg font-medium leading-6 text-gray-900 mt-8">About</h3>
  <p class="mt-1 max-w-2xl text-sm text-gray-700">
    You are using version v<strong>{{ appVersion }}</strong>
    <br />
    See the source and contribute to this
    <a href="#" @click.prevent="openBrowser('https://github.com/fitztrev/pgn-broadcaster')" class="underline">app on
      GitHub</a>
  </p>
  <p>If you're having trouble with your broadcast, please
    <a href="#" @click.prevent="openBrowser('https://discord.com/channels/1094189632691904573/1122545040686858340')">
      post to <code>#broadcast-errors</code> on the Lichess Content Discord</a>.
  </p>
</template>
