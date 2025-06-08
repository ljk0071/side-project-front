import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useKyProperties = defineStore(
  'kyProperties',
  () => {
    const csrfToken = ref('');
    const refreshToken = ref('');

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
