import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useVisited = defineStore(
  'visited',
  () => {
    const isVisited = ref(false);

    return { isVisited };
  },
  {
    persist: {
      storage: localStorage,
      pick: ['isVisited'],
    },
  },
);
