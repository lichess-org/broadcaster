<script setup lang="ts">
import Broadcast from "./components/Broadcast.vue";
</script>

<template>
  <div class="h-screen bg-gray-800 p-12">
    <div class="text-center mb-12">
      <img src="./assets/lichess-white.svg" class="w-24 inline-block" alt="Lichess logo" />
    </div>

    <Broadcast />
  </div>
</template>
