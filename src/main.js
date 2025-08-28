import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './styles/variables.css';
import './styles/components.css';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);

app.mount('#app');
