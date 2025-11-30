import { createRouter, createWebHistory } from 'vue-router';
import BroadcastsByUser from './components/BroadcastsByUser.vue';
import BroadcastView from './components/BroadcastView.vue';
import FindBroadcast from './components/FindBroadcast.vue';
import NotFound from './components/NotFound.vue';
import Round from './components/Round.vue';
import Settings from './components/Settings.vue';
import Status from './components/Status.vue';

export enum RouteNames {
  Home = 'Home',
  FindBroadcast = 'FindBroadcast',
  Settings = 'Settings',
  NotFound = 'NotFound',
  'RelayTour.by' = 'RelayTour.by',
  'RelayTour.show' = 'RelayTour.show',
  'RelayRound.show' = 'RelayRound.show',
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Status,
      name: RouteNames.Home,
    },
    {
      path: '/find-broadcast',
      component: FindBroadcast,
      name: RouteNames.FindBroadcast,
    },
    {
      path: '/settings',
      component: Settings,
      name: RouteNames.Settings,
    },
    {
      path: '/broadcast/by/:user',
      component: BroadcastsByUser,
      name: RouteNames['RelayTour.by'],
    },
    {
      path: '/broadcast/:id',
      component: BroadcastView,
      name: RouteNames['RelayTour.show'],
    },
    {
      path: '/broadcast/:ts/:rs/:id',
      component: Round,
      name: RouteNames['RelayRound.show'],
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFound,
      name: RouteNames.NotFound,
    },
  ],
});
