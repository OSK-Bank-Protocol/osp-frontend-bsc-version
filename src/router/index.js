import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import FaqView from '../views/FaqView.vue';
import AboutView from '../views/AboutView.vue';
import ContactView from '../views/ContactView.vue';
import BlogView from '../views/BlogView.vue';
import BlogDetailView from '../views/BlogDetailView.vue';
import PricingView from '../views/PricingView.vue';
import UseCaseView from '../views/UseCaseView.vue';
import UseCaseDetailView from '../views/UseCaseDetailView.vue';
import { walletState } from '../services/wallet';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/faq',
    name: 'Faq',
    component: FaqView,
  },
  {
    path: '/about-us',
    name: 'About',
    component: AboutView,
  },
  {
    path: '/contact-us',
    name: 'Contact',
    component: ContactView,
  },
  {
    path: '/blog',
    name: 'Blog',
    component: BlogView,
  },
  {
    path: '/blog-detail',
    name: 'BlogDetail',
    component: BlogDetailView,
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: PricingView,
  },
  {
    path: '/use-case',
    name: 'UseCase',
    component: UseCaseView,
  },
  {
    path: '/use-case-detail',
    name: 'UseCaseDetail',
    component: UseCaseDetailView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'auto' };
    }
  },
});

router.beforeEach((to, from, next) => {
  // Ensure the wallet is on the correct network after navigation.
  if (walletState.isConnected) {
    // We use window.location to check the URL because the router's `to` object
    // might not be fully updated yet when this guard is triggered on initial page load.
    // A small timeout ensures the check runs after the new URL is reflected.
    // ensureCorrectNetwork check removed for Tron migration
  }
  next();
});

export default router;
