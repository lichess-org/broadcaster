<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useLogStore } from "../stores/logs";

const logs = useLogStore();
const logViewer = ref<HTMLElement | null>(null);

function isScrolledToBottom(): boolean {
  if (logViewer.value) {
    return (
      logViewer.value.scrollHeight -
        logViewer.value.scrollTop -
        logViewer.value.clientHeight <
      100
    );
  }

  return false;
}

function scrollToBottom(): void {
  if (logViewer.value) {
    logViewer.value.scrollTop = logViewer.value.scrollHeight;
  }
}

onMounted(() => {
  scrollToBottom();
});

logs.$subscribe(() => isScrolledToBottom() && scrollToBottom());
</script>

<template>
  <ol
    ref="logViewer"
    v-if="logs.logs.length"
    class="bg-gray-700 mt-4 p-2 text-sm font-mono flex flex-col overflow-y-auto"
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
</template>
