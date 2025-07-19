import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRefreshDetect = defineStore(
  'refreshDetect',
  () => {
    const isRefresh = ref(false);
    const sessionActive = ref(false);

    const checkRefresh = () => {
      // localStorage에 이전 세션 데이터가 있으면 새로고침
      if (sessionActive.value) {
        isRefresh.value = true;
      }
      sessionActive.value = true;
    };

    return {
      isRefresh,
      sessionActive,
      checkRefresh,
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ['sessionActive'],
    },
  },
);
