import { createRouter, createWebHistory } from 'vue-router';
import BroadcastsByUser from './components/BroadcastsByUser.vue';
import Status from './components/Status.vue';
import Round from './components/Round.vue';
import Settings from './components/Settings.vue';

export enum RouteNames {
  Home,
  Settings,
  'RelayRound.show',
  'RelayTour.by',
  'RelayRound.chapter',
  'RelayRound.teamsView',
  'RelayTour.allPrivate',
  'RelayTour.player',
  'RelayTour.playersView',
  'RelayTour.show',
  'RelayTour.subscribed',
}
export type RouteName = keyof typeof RouteNames;

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Status,
      name: RouteNames.Home.toString(),
    },
    {
      path: '/settings',
      component: Settings,
      name: RouteNames.Settings.toString(),
    },
    {
      path: '/broadcasts/:username/page/:pageNum',
      component: BroadcastsByUser,
      name: RouteNames['RelayTour.by'].toString(),
    },
    {
      path: '/round/:id',
      component: Round,
      name: RouteNames['RelayRound.show'].toString(),
    },
  ],
});
