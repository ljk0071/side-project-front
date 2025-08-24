import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useActiveParty = defineStore(
  'activeParty',
  () => {
    const hasActiveParty = ref<boolean>(false);

    const setActiveParty = (isActive: boolean) => {
      hasActiveParty.value = isActive;
    };

    const resetActiveParty = () => {
      hasActiveParty.value = false;
    };

    return {
      hasActiveParty,
      setActiveParty,
      resetActiveParty,
    };
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['hasActiveParty'],
    },
  },
);