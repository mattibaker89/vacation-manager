import { createRouter, createWebHistory } from 'vue-router';
import RequesterView from '../views/RequesterView.vue';
import ValidatorView from '../views/ValidatorView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/requester' },
    { path: '/requester', component: RequesterView },
    { path: '/validator', component: ValidatorView },
  ],
});

export default router;
