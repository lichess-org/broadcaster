<script setup lang="ts">
import { computed } from "vue";
import { useLogStore } from "../stores/logs";

const logs = useLogStore();

type Status = "Idle" | "Broadcasting";

const broadcastingCount = computed<number>(() => {
  return logs.watchProcesses.size;
});

const status = computed<Status>(() => {
  if (broadcastingCount.value > 0) {
    return "Broadcasting";
  }

  return "Idle";
});
</script>

<template>
  <div class="mx-auto max-w-7xl">
    <div class="grid grid-cols-4 gap-px bg-white/5">
      <div
        class="bg-gray-700 px-4 py-6 sm:px-6 lg:px-8"
        :class="{
          'bg-green-800': status === 'Broadcasting',
        }"
      >
        <p class="text-sm font-medium leading-6 text-gray-400">Status</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-2xl font-semibold tracking-tight text-white">{{
            status
          }}</span>
        </p>
      </div>
      <div class="bg-gray-700 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Rounds</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{{
            broadcastingCount
          }}</span>
        </p>
      </div>
      <div class="bg-gray-700 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Games</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{{
            logs.files.size
          }}</span>
        </p>
      </div>
      <div class="bg-gray-700 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Moves</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{{
            logs.moveCount
          }}</span>
        </p>
      </div>
    </div>
  </div>
  <div
    v-if="logs.logs.length"
    class="bg-gray-700 text-gray-100 mt-4 p-2 text-sm font-mono h-1/2"
  >
    <div v-for="log in logs.logs"
      :class="{
        'text-red-400': log.type === 'error',
      }"
    >
      {{ log.date.toLocaleTimeString() }} -
      {{ log.message }}
    </div>
  </div>
</template>
