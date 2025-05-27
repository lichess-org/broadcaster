<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useLogStore } from '../stores/logs';
import { watch } from 'vue';

const logs = useLogStore();
const logViewer = ref<HTMLElement | null>(null);
const autoScroll = ref<boolean>(true);

function scrollToBottom(): void {
  if (logViewer.value) {
    logViewer.value.scrollTop = logViewer.value.scrollHeight;
  }
}

onMounted(() => {
  scrollToBottom();
});

logs.$subscribe(() => autoScroll.value && scrollToBottom());

watch(autoScroll, value => {
  if (value) {
    scrollToBottom();
  }
});
</script>

<template>
  <ol
    ref="logViewer"
    v-if="logs.logs.length"
    class="bg-gray-700 mt-4 p-2 text-sm font-mono flex flex-col overflow-y-auto h-[calc(80vh)]"
  >
    <li
      v-for="log in logs.logs"
      :class="{
        'text-gray-100': log.color === 'white',
        'text-red-400': log.color === 'red',
        'text-green-400': log.color === 'green',
        'text-blue-400': log.color === 'blue',
      }"
    >
      {{ log.date.toLocaleTimeString() }} -
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
