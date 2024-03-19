import { createRouter, createWebHistory, type RouteLocation } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CallbackView from '@/views/CallbackView.vue';
import { createAuthGuard } from '@auth0/auth0-vue';
import app from '@/app';
import { unref, type App } from 'vue';
import { Role } from '@/models/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      beforeEnter: createAuthGuard(app),
      component: HomeView,
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallbackView,
    },
    {
      path: '/my-reservations',
      name: 'my-reservations',
      beforeEnter: createAuthGuard(app),
      component: () => import('../views/MyReservations.vue'),
    },
    {
      path: '/user-management',
      name: 'user-management',
      beforeEnter: [createAuthGuard(app), createRoleGuard(app)],
      meta: { roles: [Role.ADMIN] },
      component: () => import('../views/UserManagement.vue'),
    },
  ],
});

export default router;

function createRoleGuard(app: App) {
  return (to: RouteLocation) => {
    const { roles } = to.meta;
    if (!roles) return true;
    const auth0 = app.config.globalProperties.$auth0;
    const user = unref(auth0.user);
    return (roles as Role[]).includes(user?.role) || { name: 'dashboard' };
  };
}
