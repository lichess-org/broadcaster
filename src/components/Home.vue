<script setup lang="ts">
import { useUserStore } from "../stores/user";
import LichessLogin from "./LichessLogin.vue";
import Stats from "./Stats.vue";

const user = useUserStore()
</script>

<template>
  <Stats v-if="user.isLoggedIn()" />
  <LichessLogin v-else />
</template>
