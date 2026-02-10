import { createApp } from 'vue';
// 디자인 시스템 스타일은 SCSS 인덱스를 통해 제공됨
import router from '@/router';
import '@/styles/index.scss';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');
