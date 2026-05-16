import { createRouter, createWebHistory } from 'vue-router';
import RequesterView from '../views/RequesterView.vue';
import ValidatorDashboardView from '../views/ValidatorDashboardView.vue';
import ValidatorView from '../views/ValidatorView.vue';
import UsersView from '../views/UsersView.vue';
import LoginView from '../views/LoginView.vue';
import { useAuth } from '../composables/useAuth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/', redirect: '/requester' },
    { path: '/requester', component: RequesterView },
    { path: '/validator', component: ValidatorDashboardView, meta: { requiresValidator: true } },
    { path: '/validator/requests', component: ValidatorView, meta: { requiresValidator: true } },
    { path: '/users', component: UsersView, meta: { requiresValidator: true } },
  ],
});

router.beforeEach((to) => {
  const { isAuthenticated, isValidator } = useAuth();

  if (!to.meta.public && !isAuthenticated.value) {
    return '/login';
  }

  if (to.meta.requiresValidator && !isValidator.value) {
    return '/requester';
  }
});

export default router;
