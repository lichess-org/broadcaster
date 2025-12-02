<script setup lang="ts">
import { useStatusStore } from '../stores/status';
import LogViewer from './LogViewer.vue';

const status = useStatusStore();
</script>

<template>
  <div class="grid grid-cols-2 gap-px bg-white/5">
    <div
      class="bg-gray-700 px-4 py-6 sm:px-6 lg:px-8"
      :class="{
        'bg-green-800': status.activeCount > 0,
      }"
    >
      <p class="text-sm font-medium leading-6 text-gray-400">Status</p>
      <p class="mt-2 flex items-baseline gap-x-2">
        <span class="text-2xl font-semibold tracking-tight text-white">{{ status.friendly }}</span>
      </p>
    </div>
    <div class="bg-gray-700 px-4 py-6 sm:px-6 lg:px-8">
      <p class="text-sm font-medium leading-6 text-gray-400">Rounds</p>
      <p class="mt-2 flex items-baseline gap-x-2">
        <span class="text-4xl font-semibold tracking-tight text-white">{{ status.activeCount }}</span>
      </p>
    </div>
  </div>
  <LogViewer />
</template>
