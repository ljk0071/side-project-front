import { createRouter, createWebHistory } from 'vue-router';
import MainPage from '@/views/MainPage.vue';
import ClosePopUp from '@/components/ClosePopUp.vue';
import NotFoundPage from '@/views/NotFoundPage.vue';
import TermsOfUse from '@/views/TermsOfUse.vue';
import TermsOfPrivacy from '@/views/TermsOfPrivacy.vue';
import TermsOfChat from '@/views/TermsOfChat.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainPage,
    },
    {
      path: '/pop-up/close',
      name: 'popup-close',
      component: ClosePopUp,
    },
    {
      path: '/terms/use',
      name: 'terms-of-use',
      component: TermsOfUse,
    },
    {
      path: '/terms/privacy',
      name: 'terms-of-privacy',
      component: TermsOfPrivacy,
    },
    {
      path: '/terms/chat',
      name: 'terms-of-chat',
      component: TermsOfChat,
    },
    {
      path: '/404',
      name: 'not-found',
      component: NotFoundPage,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'catch-all',
      redirect: '/404',
    },
  ],
});

export default router;
