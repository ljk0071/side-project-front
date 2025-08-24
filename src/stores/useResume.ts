import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { Resume } from '@/types/response'
import { getCurrentUserResume, createResume } from '@/utils/apis/resume'
import { kyWithCustom } from '@/utils/ky/kyWithCustom'
import { useAuth } from './useAuth'

export const useResume = defineStore(
  'resume',
  () => {
    const auth = useAuth()

    const resume = ref<Resume | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // 지원한 파티 목록
    const appliedParties = ref<number[]>([])
    const rejectedParties = ref<number[]>([])
    const isAppliedPartiesLoading = ref(false)

    /**
     * 현재 로그인한 사용자의 이력서를 조회합니다.
     */
    const fetchCurrentUserResume = async (): Promise<void> => {
      if (!auth.isAuthenticated) {
        error.value = '로그인이 필요합니다.'
        return
      }

      try {
        isLoading.value = true
        error.value = null

        const data = await getCurrentUserResume()
        resume.value = data
      } catch (err: unknown) {
        error.value = err.message || '이력서 조회에 실패했습니다.'
        console.error('Resume fetch error:', err)
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 이력서를 생성합니다.
     */
    const submitResume = async (contents: string): Promise<boolean> => {
      if (!auth.isAuthenticated) {
        error.value = '로그인이 필요합니다.'
        return false
      }

      try {
        isLoading.value = true
        error.value = null

        await createResume(contents)

        // 생성 후 최신 데이터를 다시 조회
        await fetchCurrentUserResume()

        return true
      } catch (err: unknown) {
        error.value = err.message || '이력서 생성에 실패했습니다.'
        console.error('Resume creation error:', err)
        return false
      } finally {
        isLoading.value = false
      }
    }

    /**
     * 지원한 파티 목록을 가져옵니다.
     */
    const fetchAppliedParties = async (): Promise<void> => {
      if (!auth.isAuthenticated) {
        appliedParties.value = []
        return
      }

      try {
        isAppliedPartiesLoading.value = true
        const response = await kyWithCustom('get', 'v1/party/application').json<{
          data: { partyRecruitId: number }[];
        }>()
        appliedParties.value = response.data.map((item) => item.partyRecruitId)
      } catch (err) {
        console.error('지원한 파티 목록 가져오기 실패:', err)
        appliedParties.value = []
      } finally {
        isAppliedPartiesLoading.value = false
      }
    }

    /**
     * 특정 파티에 지원했는지 확인하는 computed
     */
    const isPartyApplied = (partyId: number) => {
      return computed(() => appliedParties.value.includes(partyId))
    }

    /**
     * 파틴 지원 후 목록 업데이트
     */
    const addAppliedParty = (partyId: number): void => {
      if (!appliedParties.value.includes(partyId)) {
        appliedParties.value.push(partyId)
      }
    }

    /**
     * 에러 상태를 초기화합니다.
     */
    const clearError = (): void => {
      error.value = null
    }

    /**
     * 이력서 상태를 초기화합니다.
     */
    const resetResume = (): void => {
      resume.value = null
      error.value = null
      isLoading.value = false
      appliedParties.value = []
    }

    watch(
      () => auth.isLoggedIn,
      async (isLoggedIn) => {
        if (isLoggedIn) {
          // 로그인 성공 후 이력서 조회 및 지원 목록 조회
          await Promise.all([fetchCurrentUserResume(), fetchAppliedParties()])
        } else {
          // 로그아웃 시 초기화
          appliedParties.value = []
        }
      }
    )

    return {
      resume,
      isLoading,
      error,
      appliedParties,
      rejectedParties,
      isAppliedPartiesLoading,
      fetchCurrentUserResume,
      fetchAppliedParties,
      submitResume,
      isPartyApplied,
      addAppliedParty,
      clearError,
      resetResume
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['resume', 'appliedParties', 'rejectedParties']
    }
  }
)
