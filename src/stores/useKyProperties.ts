import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useKyProperties = defineStore(
  'kyProperties',
  () => {
    const csrfToken = ref<string | null>('');
    const refreshToken = ref<string | null>('');

    return { csrfToken, refreshToken };
  },
  {
    persist: [
      {
        storage: sessionStorage,
        pick: ['csrfToken'],
      },
      {
        storage: localStorage,
        pick: ['refreshToken'],
      },
    ],
  },
);
