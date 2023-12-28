<script setup lang="ts">
import { useLogStore } from "../stores/logs";

const logs = useLogStore();
</script>

<template>
  <div
    v-if="logs.logs.length"
    class="bg-gray-700 text-gray-100 mt-4 p-2 text-sm font-mono h-96 overflow-scroll"
  >
    <div
      v-for="log in logs.logs"
      :class="{
        'text-red-400': log.type === 'error',
      }"
    >
      {{ log.date.toLocaleTimeString() }} -
      {{ log.message }}
    </div>
  </div>
</template>
