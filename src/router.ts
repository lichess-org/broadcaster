import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import Settings from "./components/Settings.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/settings", component: Settings },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
