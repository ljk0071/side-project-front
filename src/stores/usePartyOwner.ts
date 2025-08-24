import { computed, ref } from 'vue'
import { useAuth } from '@/stores/useAuth.ts'
import { parties } from '@/composables/useParty.ts'
import { defineStore } from 'pinia'

export const usePartyOwner = defineStore(
  'partyOwner',
  () => {
    const isMyParty = ref<null | boolean>(false)
    const partyRecruitId = ref<null | number>(null)
    const hasCreatedParty = ref(false)

    return { isMyParty, partyRecruitId, hasCreatedParty }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['isMyParty', 'partyRecruitId', 'hasCreatedParty']
    }
  }
)
