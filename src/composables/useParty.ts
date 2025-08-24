import { kyWithCustom } from '@/utils/ky/kyWithCustom.ts';
import type { ApiResponse } from '@/types/response.ts';
import type { Party } from '@/components/PartyCard.vue';
import { ref } from 'vue';

/**
 * 카드 데이터 배열
 * 각 카드는 제목, 설명, 태그, 이미지 색상, 현재 멤버 수, 최대 멤버 수 정보를 포함합니다.
 */
const parties = ref<Array<Party>>([]);

/**
 * API 호출 함수
 */
const fetchParties = async (searchKeyword: string = '') => {
  const queryParams: Record<string, string> = { searchConditions: 'ALL' };

  if (searchKeyword.trim()) {
    queryParams.searchKeyword = searchKeyword.trim();
  }
  const response = (await kyWithCustom('get', 'v1/party', queryParams).json()) as ApiResponse<
    Party[]
  >;
  return response.data;
};

export { fetchParties, parties };
