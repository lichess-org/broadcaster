<script setup lang="ts">
import { useUserStore } from "../stores/user";
import LichessLogin from "./LichessLogin.vue";
import Broadcasts from "./Broadcasts.vue";

const user = useUserStore()
</script>

<template>
  <Broadcasts v-if="user.isLoggedIn()" />
  <LichessLogin v-else />
</template>
