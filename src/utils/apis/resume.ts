import { kyWithCustom } from '@/utils/ky/kyWithCustom';
import type { Resume } from '@/types/response';

/**
 * Resume API 관련 유틸리티 함수들
 */

/**
 * 현재 로그인한 사용자의 이력서를 조회합니다.
 * @returns Promise<Resume | null> - 이력서 데이터 또는 null (이력서가 없는 경우)
 */
export const getCurrentUserResume = async (): Promise<Resume | null> => {
  try {
    const response = (await kyWithCustom('get', 'v1/resume').json()) as Resume;
    return response;
  } catch (error: unknown) {
    // 204 No Content인 경우 (이력서가 없는 경우)
    if (error.response?.status === 204) {
      return null;
    }
    // 다른 에러는 다시 throw
    throw error;
  }
};

/**
 * 이력서를 생성합니다.
 * @param contents - 이력서 내용
 * @returns Promise<void>
 */
export const createResume = async (contents: string): Promise<void> => {
  await kyWithCustom('post', 'v1/resume', {
    contents,
  });
};
