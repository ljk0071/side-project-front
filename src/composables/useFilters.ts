/**
 * useFilters.ts - 필터 관리 컴포저블
 *
 * 이 파일은 필터 기능을 위한 재사용 가능한 컴포저블 함수를 제공합니다.
 * Vue의 Composition API를 활용하여 필터 상태 관리와 관련 로직을 캡슐화합니다.
 */

import type { Ref } from 'vue';
import { ref } from 'vue';

/**
 * 필터 옵션 인터페이스
 * 필터의 고유 식별자, 스타일링을 위한 색상 정보, 표시 텍스트를 정의합니다.
 */
export interface FilterOption {
  id: string; // 필터의 고유 식별자
  color: string; // 필터 텍스트 색상
  bgColor: string; // 필터 배경 색상
  label?: string; // 표시 텍스트 (없으면 id 사용)
}

/**
 * useFilters 컴포저블 옵션 인터페이스
 * 필터 동작을 세부적으로 제어하기 위한 옵션들을 정의합니다.
 */
export interface UseFiltersOptions {
  defaultFilter?: string; // 기본 선택 필터 (예: '전체')
  multiSelect?: boolean; // 다중 선택 가능 여부
  autoSelectDefault?: boolean; // 모든 필터가 해제되면 기본 필터로 돌아가는지 여부
}

/**
 * 필터 관리를 위한 컴포저블 함수
 *
 * @param initialSelected - 초기 선택된 필터 배열 (반응형 참조 또는 일반 배열)
 * @param filterOptions - 사용 가능한 필터 옵션 배열
 * @param options - 필터 동작 설정 옵션
 * @returns 필터 상태와 관련 메서드를 포함하는 객체
 */
export function useFilters(
  initialSelected: Ref<string[]> | string[],
  filterOptions: FilterOption[],
  options: UseFiltersOptions = {},
) {
  // 기본 옵션 설정 (구조 분해 할당으로 기본값 지정)
  const {
    defaultFilter = filterOptions[0]?.id || '',
    multiSelect = true,
    autoSelectDefault = true,
  } = options;

  // 선택된 필터 배열 (Ref 또는 배열이 들어올 수 있음)
  const selectedFilters = Array.isArray(initialSelected)
    ? ref<string[]>(initialSelected)
    : initialSelected;

  // 애니메이션을 위한 상태
  const lastToggledFilter = ref<string | null>(null);
  const animating = ref(false);

  /**
   * 필터 토글 함수 - 필터 선택/해제를 처리
   * @param filterId - 토글할 필터 ID
   */
  const toggleFilter = (filterId: string) => {
    // 기본 필터(보통 '전체')를 클릭한 경우, 해당 필터만 선택
    if (filterId === defaultFilter) {
      selectedFilters.value = [defaultFilter];
      return;
    }

    // 현재 선택 목록 복사 (불변성 유지)
    const newSelection = [...selectedFilters.value];

    // 기본 필터가 선택되어 있다면 제거
    if (newSelection.includes(defaultFilter)) {
      newSelection.splice(newSelection.indexOf(defaultFilter), 1);
    }

    // 클릭한 필터가 이미 선택되어 있는지 확인
    const index = newSelection.indexOf(filterId);

    if (index === -1) {
      // 다중 선택 모드가 아니면 기존 선택 초기화
      if (!multiSelect) {
        newSelection.length = 0;
      }
      // 선택되지 않은 상태면 추가
      newSelection.push(filterId);
    } else {
      // 이미 선택된 상태면 제거
      newSelection.splice(index, 1);

      // 모든 필터가 해제되고 자동 선택 옵션이 켜져있으면 기본 필터로 돌아감
      if (newSelection.length === 0 && autoSelectDefault) {
        // 애니메이션 상태 설정 - 마지막으로 토글된 필터 ID 저장
        lastToggledFilter.value = filterId;
        animating.value = true;

        // 애니메이션 시간을 늘려서 두 애니메이션이 연결되게 함
        setTimeout(() => {
          animating.value = false;
          lastToggledFilter.value = null;
        }, 700); // 이동 애니메이션(500ms) + 페이드인 시작 지연(200ms)

        // 기본 필터로 설정
        selectedFilters.value = [defaultFilter];
        return;
      }
    }

    // 선택 상태 업데이트
    selectedFilters.value = newSelection;
  };

  /**
   * 필터 선택 여부 확인 함수
   * @param filterId - 확인할 필터 ID
   * @returns 필터가 선택되었는지 여부
   */
  const isFilterSelected = (filterId: string) => {
    return selectedFilters.value.includes(filterId);
  };

  /**
   * 애니메이션 스타일 계산 함수
   * @returns 애니메이션 스타일 객체
   */
  const getAnimationStyle = () => {
    if (!lastToggledFilter.value) return {};

    // 마지막으로 토글된 필터의 배경색과 위치 정보 찾기
    const lastFilter = filterOptions.find((f) => f.id === lastToggledFilter.value);
    if (!lastFilter) return {};

    return {
      backgroundColor: lastFilter.bgColor,
      startFilterId: lastToggledFilter.value,
    };
  };

  // 마지막으로 토글된 필터의 위치 정보 저장
  const lastToggledPosition = ref({ x: 0, y: 0 });

  /**
   * 마지막 토글된 필터 위치 업데이트 함수
   * @param x - X 좌표
   * @param y - Y 좌표
   */
  const updateLastToggledPosition = (x: number, y: number) => {
    lastToggledPosition.value = { x, y };
  };

  /**
   * ID로 필터 옵션 찾기
   * @param id - 찾을 필터 ID
   * @returns 필터 옵션 객체 또는 undefined
   */
  const getFilterById = (id: string) => {
    return filterOptions.find((filter) => filter.id === id);
  };

  // 필터 관련 상태와 메서드 반환
  return {
    selectedFilters,
    toggleFilter,
    isFilterSelected,
    lastToggledFilter,
    animating,
    getAnimationStyle,
    getFilterById,
    lastToggledPosition,
    updateLastToggledPosition,
  };
}
