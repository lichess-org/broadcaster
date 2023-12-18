<script setup lang="ts">
import { useUserStore } from "../stores/user";
import LichessLogin from "./LichessLogin.vue";
import Dashboard from "./Dashboard.vue";

const user = useUserStore()
</script>

<template>
  <Dashboard v-if="user.isLoggedIn()" />
  <LichessLogin v-else />
</template>
