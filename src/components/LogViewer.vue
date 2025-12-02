<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useLogStore, type Log } from '../stores/logs';

const logs = useLogStore();
const logViewer = ref<HTMLElement | null>(null);
const autoScroll = ref<boolean>(true);
const displayedLogs = ref<Log[]>([]);

function scrollToBottom(): void {
  if (logViewer.value) {
    logViewer.value.scrollTop = logViewer.value.scrollHeight;
  }
}

async function loadLogs(): Promise<void> {
  displayedLogs.value = await logs.getLogs(1000);
  if (autoScroll.value) {
    await new Promise(resolve => setTimeout(resolve, 0));
    scrollToBottom();
  }
}

onMounted(() => {
  loadLogs();
});

watch(
  () => logs.logChangeCounter,
  () => {
    loadLogs();
  },
);

watch(autoScroll, value => {
  if (value) {
    scrollToBottom();
  }
});
</script>

<template>
  <ol
    ref="logViewer"
    v-if="displayedLogs.length"
    class="bg-gray-700 mt-4 p-2 text-sm font-mono flex flex-col overflow-y-auto h-[calc(80vh)]"
  >
    <li
      v-for="log in displayedLogs"
      :key="log.id"
      class="text-gray-100"
      :class="{
        'text-red-400': log.type === 'error',
      }"
    >
      {{ new Date(log.timestamp).toLocaleTimeString() }} -
      {{ log.message }}
    </li>
  </ol>
  <div class="text-white text-right">
    <label>
      <input type="checkbox" v-model="autoScroll" class="mt-2" />
      Auto-scroll
    </label>
  </div>
</template>
