<script setup lang="ts">
import { useLogStore } from "../stores/logs";

const logs = useLogStore();

function isScrolledToBottom(): boolean {
  const logViewer = document.querySelector("#log-viewer");
  if (logViewer) {
    return (
      logViewer.scrollHeight - logViewer.scrollTop - logViewer.clientHeight <
      100
    );
  }

  return false;
}

function scrollToBottom(): void {
  const logViewer = document.querySelector("#log-viewer");
  if (logViewer) {
    logViewer.scrollTop = logViewer.scrollHeight;
  }
}

setTimeout(() => {
  scrollToBottom();
}, 100);

logs.$subscribe(() => {
  if (isScrolledToBottom()) {
    scrollToBottom();
  }
});
</script>

<template>
  <ol
    v-if="logs.logs.length"
    id="log-viewer"
    class="bg-gray-700 mt-4 p-2 text-sm font-mono flex flex-col overflow-auto"
  >
    <li
      v-for="log in logs.logs"
      :class="{
        'text-gray-100': log.color === 'white',
        'text-red-400': log.color === 'red',
        'text-green-400': log.color === 'green',
      }"
    >
      {{ log.date.toLocaleTimeString() }} -
      {{ log.message }}
    </li>
  </ol>
</template>
