<script setup lang="ts">
import { ref } from 'vue';
import { lichessApiClient } from '../client';
import { useFavoritesStore } from '../stores/favorites';

const username = ref('');
const error = ref('');

const favorites = useFavoritesStore();

function save() {
  lichessApiClient()
    .GET('/api/user/{username}', {
      params: {
        path: {
          username: username.value,
        },
      },
    })
    .then(response => {
      if (response.data?.username) {
        favorites.add(response.data.username);
      }
      username.value = '';
    })
    .catch(e => {
      error.value = e;
    });
}
</script>

<template>
  <div class="md:col-span-2">
    <form @submit.prevent="save">
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div class="col-span-full">
          <label for="username" class="block text-sm font-medium leading-6 text-white">Other Lichess username</label>
          <div class="mt-2">
            <div
              class="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
            >
              <input
                type="text"
                id="username"
                autocomplete="off"
                class="flex-1 border-0 bg-transparent py-1.5 px-2 text-white focus:ring-0 sm:text-sm sm:leading-6"
                v-model="username"
                @keydown="error = ''"
              />
            </div>
            <div v-if="error" class="mt-2 text-sm text-red-400">{{ error }}</div>
          </div>
        </div>
      </div>

      <div class="mt-4 flex">
        <button
          type="submit"
          class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Add
        </button>
      </div>
    </form>
  </div>
</template>
