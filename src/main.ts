import { convexVue } from 'convex-vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/css/app.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(convexVue, {
    url: import.meta.env.VITE_CONVEX_URL,
});
app.mount('#app');
