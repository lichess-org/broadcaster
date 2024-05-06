import { createRouter, createWebHistory } from 'vue-router';
import Broadcasts from './components/Broadcasts.vue';
import Status from './components/Status.vue';
import Round from './components/Round.vue';
import Settings from './components/Settings.vue';

const routes = [
  { path: '/', component: Status },
  { path: '/broadcasts', component: Broadcasts },
  { path: '/settings', component: Settings },
  { path: '/round/:id', component: Round, name: 'round' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
