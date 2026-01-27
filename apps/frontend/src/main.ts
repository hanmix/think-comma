import { createApp } from 'vue';
// Design system styles are provided via SCSS index
import router from '@/router';
import '@/styles/index.scss';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');
