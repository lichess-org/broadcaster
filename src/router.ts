import { createRouter, createWebHistory } from 'vue-router';
import BroadcastsByUser from './components/BroadcastsByUser.vue';
import Status from './components/Status.vue';
import Round from './components/Round.vue';
import Settings from './components/Settings.vue';
import NavigateByUrl from './components/NavigateByUrl.vue';

export enum RouteNames {
  Home,
  NavigateByUrl,
  Settings,
  'RelayTour.by',
  'RelayRound.show',
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Status,
      name: RouteNames.Home.toString(),
    },
    {
      path: '/navigate-by-url',
      component: NavigateByUrl,
      name: RouteNames.NavigateByUrl.toString(),
    },
    {
      path: '/settings',
      component: Settings,
      name: RouteNames.Settings.toString(),
    },
    {
      path: '/broadcast/by/:user',
      component: BroadcastsByUser,
      name: RouteNames['RelayTour.by'].toString(),
    },
    {
      path: '/broadcast/:ts/:rs/:id',
      component: Round,
      name: RouteNames['RelayRound.show'].toString(),
    },
  ],
});
