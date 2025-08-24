import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PartyApplication, Resume } from '@/types/response.ts'

export const usePartyApplications = defineStore(
  'partyApplications',
  () => {
    // 임시 지원서 내역 데이터
    const applications = ref<PartyApplication[]>([])

    const addApplication = (application: PartyApplication) => applications.value.push(application)

    const cleanApplications = () => applications.value = []

    return { applications, addApplication, cleanApplications }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['applications']
    }
  }
)
