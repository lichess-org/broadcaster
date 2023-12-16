import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import Broadcasts from "./components/Broadcasts.vue";
import Settings from "./components/Settings.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/broadcasts", component: Broadcasts },
  { path: "/settings", component: Settings },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
