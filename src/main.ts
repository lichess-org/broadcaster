import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import { router } from './router';

import App from './App.vue';
import './styles.css';
import { checkForUpdates } from './updater';

checkForUpdates();

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount('#app');
