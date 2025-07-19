import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePopUpClosed = defineStore(
  'popUpClosed',
  () => {
    const init = ref(false);
    const isSucceed = ref(false);
    const isPopUp = ref(false);
    const errorMessage = ref<string | null>(null);

    return { init, isSucceed, isPopUp, errorMessage };
  },
  {
    persist: {
      storage: localStorage,
      pick: ['init', 'isSucceed', 'isPopUp', 'errorMessage'],
    },
  },
);
