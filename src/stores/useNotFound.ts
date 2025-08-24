import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotFound = defineStore(
  'is404',
  () => {
    const is404 = ref(false);

    return { is404 };
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['is404'],
    },
  },
);
