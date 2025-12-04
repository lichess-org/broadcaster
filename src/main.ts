import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { router } from './router';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import App from './App.vue';
import './styles.css';
import { checkForUpdates } from './updater';
import { listenForDeepLinks } from './deep-links';

checkForUpdates();

await listenForDeepLinks();

const pinia = createPinia();

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Vue3Toastify, {
  autoClose: 3000,
  theme: 'dark',
  position: 'top-right',
} as ToastContainerOptions);

app.mount('#app');
