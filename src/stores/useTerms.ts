import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTerms = defineStore(
  'terms',
  () => {
    const isRead = ref(false);
    const readChatTerms = () => (isRead.value = true);
    const getReadStatus = () => isRead.value;

    return { isRead, readChatTerms, getReadStatus };
  },
  {
    persist: {
      storage: localStorage,
      pick: ['isRead'],
    },
  },
);
