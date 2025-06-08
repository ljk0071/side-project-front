<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue';
import { type FilterOption, useFilters } from '@/composables/useFilters';

interface Props {
  modelValue: string[];
  filters?: FilterOption[];
  defaultFilter?: string;
  multiSelect?: boolean;
  autoSelectDefault?: boolean;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => [
    { id: '전체', color: '#3366CC', bgColor: 'rgba(51, 102, 204, 0.1)' },
    { id: '디자인', color: '#339966', bgColor: 'rgba(51, 153, 102, 0.1)' },
    { id: '개발', color: '#9933B2', bgColor: 'rgba(153, 51, 178, 0.1)' },
    { id: '분석', color: '#E58033', bgColor: 'rgba(229, 128, 51, 0.1)' },
    { id: '데이터', color: '#2C82C9', bgColor: 'rgba(44, 130, 201, 0.1)' },
    { id: '모바일', color: '#E74C3C', bgColor: 'rgba(231, 76, 60, 0.1)' },
    { id: 'UX', color: '#8E44AD', bgColor: 'rgba(142, 68, 173, 0.1)' },
    { id: '마케팅', color: '#16A085', bgColor: 'rgba(22, 160, 133, 0.1)' },
    { id: '전략', color: '#F39C12', bgColor: 'rgba(243, 156, 18, 0.1)' },
    { id: 'UI', color: '#D35400', bgColor: 'rgba(211, 84, 0, 0.1)' },
    { id: '컴포넌트', color: '#1ABC9C', bgColor: 'rgba(26, 188, 156, 0.1)' },
    { id: '교육', color: '#3498DB', bgColor: 'rgba(52, 152, 219, 0.1)' },
    { id: '온라인', color: '#27AE60', bgColor: 'rgba(39, 174, 96, 0.1)' },
    { id: '소셜', color: '#C0392B', bgColor: 'rgba(192, 57, 43, 0.1)' },
    { id: '커뮤니티', color: '#7F8C8D', bgColor: 'rgba(127, 140, 141, 0.1)' },
    { id: '게임', color: '#9B59B6', bgColor: 'rgba(155, 89, 182, 0.1)' },
  ],
  defaultFilter: '전체',
  multiSelect: true,
  autoSelectDefault: true,
  label: '조건:',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

// 필터바 참조
const filterBarRef = ref<HTMLElement | null>(null);
const defaultFilterRef = ref<HTMLElement | null>(null);

// 모달 상태 관리
const isModalOpen = ref(false);
const modalRef = ref<HTMLElement | null>(null);
const dragonAnimationActive = ref(false);

// 툴팁 상태
const showTooltip = ref(false);

// 드래곤 애니메이션 상태
const isHoveringDragonBtn = ref(false);

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;

  // 모달이 열릴 때 body 스크롤 방지
  if (isModalOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// 드래곤 호버 효과 처리 (버튼 색만 변경)
const handleDragonButtonHover = (isHovering: boolean) => {
  isHoveringDragonBtn.value = isHovering;

  // 호버 시 툴팁 표시
  showTooltip.value = isHovering && !isModalOpen.value;
};

const closeModal = (e: MouseEvent) => {
  // 모달 외부 클릭 시 닫기
  if (modalRef.value && !modalRef.value.contains(e.target as Node)) {
    isModalOpen.value = false;
    document.body.style.overflow = '';
  }
};

// v-model 컴퓨티드 속성
const selectedFilter = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// useFilters composable 사용
const { toggleFilter, isFilterSelected, animating, lastToggledFilter } = useFilters(
  selectedFilter,
  props.filters,
  {
    defaultFilter: props.defaultFilter,
    multiSelect: props.multiSelect,
    autoSelectDefault: props.autoSelectDefault,
  },
);

// 필터 버튼 스타일 계산 함수
const getFilterButtonStyle = (filter: FilterOption) => {
  const isSelected = isFilterSelected(filter.id);

  // '전체' 필터이면서 다른 필터가 선택된 경우 (초기화 모드)
  if (filter.id === props.defaultFilter && selectedFilterCount.value > 0) {
    return {
      backgroundColor: isSelected ? 'rgba(255, 59, 48, 0.1)' : 'transparent',
      color: isSelected ? '#ff3b30' : 'var(--filter-text-color)',
      borderColor: isSelected ? '#ff3b30' : '#d1d1d1',
    };
  }

  // 일반 필터 스타일
  return {
    backgroundColor: isSelected ? filter.bgColor : 'transparent',
    color: isSelected ? filter.color : 'var(--filter-text-color)',
    borderColor: isSelected ? filter.color : '#d1d1d1', // 선택되지 않은 경우 기본 테두리 색상
  };
};

// 드래곤 버튼 스타일 계산
const getDragonButtonStyle = computed(() => {
  const isActive = selectedFilterCount.value > 0;

  return {
    backgroundColor: isActive ? 'rgba(255, 90, 31, 0.1)' : 'transparent',
    color: isActive ? '#ff5a1f' : 'var(--filter-text-color)',
    borderColor: isActive || isHoveringDragonBtn.value ? '#ff5a1f' : '#d1d1d1',
    borderWidth: isActive || isHoveringDragonBtn.value ? '2px' : '1px',
    boxShadow: isActive ? '0 2px 8px rgba(255, 90, 31, 0.3)' : 'none',
  };
});

// 비기본 필터 계산
const nonDefaultFilters = computed(() => {
  return props.filters.filter((filter) => filter.id !== props.defaultFilter);
});

// 선택된 필터 카운트
const selectedFilterCount = computed(() => {
  return selectedFilter.value.filter((f) => f !== props.defaultFilter).length;
});

// 전체 버튼 텍스트 - 다른 필터가 선택되면 "초기화"로 표시
const defaultButtonText = computed(() => {
  return selectedFilterCount.value > 0 ? '초기화' : props.defaultFilter;
});

// 컴포넌트 언마운트 시 body 상태 복구
onUnmounted(() => {
  document.body.style.overflow = '';
});

// 필터 버튼 클릭 핸들러
const handleFilterClick = async (filterId: string, index: number) => {
  // 필터 토글
  toggleFilter(filterId);
};
</script>

<template>
  <div ref="filterBarRef" aria-label="필터 옵션" class="filter-bar" role="toolbar">
    <div class="filter-header">
      <span
        v-if="label"
        class="filter-label"
        style="display: inline-block; writing-mode: horizontal-tb; direction: ltr"
        >{{ label }}</span
      >
      <button
        ref="defaultFilterRef"
        :aria-checked="isFilterSelected(defaultFilter)"
        :aria-label="`${isFilterSelected(defaultFilter) ? '초기화' : defaultFilter} 필터 ${isFilterSelected(defaultFilter) ? '선택됨' : '선택되지 않음'}`"
        :class="{
          active: isFilterSelected(defaultFilter),
          'reset-mode': selectedFilterCount > 0,
        }"
        :style="getFilterButtonStyle(filters[0])"
        class="filter-button default-filter"
        role="checkbox"
        @click="handleFilterClick(defaultFilter, 0)"
      >
        <span class="filter-text">{{ defaultButtonText }}</span>
      </button>

      <!-- 드래곤 스타일의 직업 필터 버튼 (불꽃 효과 없음) -->
      <div class="job-filter-wrapper">
        <button
          :aria-expanded="isModalOpen"
          :class="{
            active: selectedFilterCount > 0,
            'dragon-hover': isHoveringDragonBtn,
          }"
          :style="getDragonButtonStyle"
          aria-haspopup="dialog"
          class="filter-button job-filter dragon-button"
          @click="toggleModal"
          @mouseenter="handleDragonButtonHover(true)"
          @mouseleave="handleDragonButtonHover(false)"
        >
          <span class="filter-text">직업</span>
          <span v-if="selectedFilterCount > 0" class="filter-badge">{{ selectedFilterCount }}</span>
          <!--          <span :class="{ rotated: isModalOpen }" class="filter-icon expand-icon"> ▼ </span>-->
        </button>

        <!-- 툴팁: 클릭하면 직업 필터 모달이 나타납니다 -->
        <div v-if="showTooltip" class="tooltip">클릭하면 모든 직업 필터가 표시됩니다</div>

        <!-- 클릭 가능한 버튼을 나타내는 물결 효과 -->
        <div :class="{ active: isHoveringDragonBtn }" class="click-indicator"></div>
      </div>
    </div>

    <!-- 필터 모달 -->
    <teleport to="body">
      <div v-if="isModalOpen" class="filter-modal-backdrop" @click="closeModal">
        <div ref="modalRef" class="filter-modal" @click.stop>
          <div class="filter-modal-header">
            <h3>직업 필터</h3>
            <button class="modal-close-btn" @click="toggleModal">✕</button>
          </div>
          <div class="filter-modal-content">
            <div class="filter-buttons modal-buttons">
              <button
                v-for="(filter, index) in nonDefaultFilters"
                :key="filter.id"
                :aria-checked="isFilterSelected(filter.id)"
                :aria-label="`${filter.label || filter.id} 필터 ${isFilterSelected(filter.id) ? '선택됨' : '선택되지 않음'}`"
                :class="{
                  active: isFilterSelected(filter.id),
                }"
                :style="getFilterButtonStyle(filter)"
                class="filter-button"
                role="checkbox"
                @click="handleFilterClick(filter.id, index + 1)"
              >
                <span class="filter-text">{{ filter.label || filter.id }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  perspective: 1000px;
}

.filter-header {
  display: flex;
  flex-direction: row; /* 명시적으로 가로 방향 지정 */
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
}

.filter-label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: var(--filter-label-color, #333);
  transition: color 0.3s ease;
  writing-mode: horizontal-tb; /* 가로 텍스트 방향 강제 */
  display: inline-block; /* 인라인 블록으로 표시 */
  text-orientation: mixed; /* 텍스트 방향 설정 */
  white-space: nowrap; /* 줄바꿈 방지 */
}

.default-filter {
  width: 80px; /* 원래 크기로 복원 */
  height: 32px; /* 높이도 원래 크기로 복원 */
  border: 1px solid #d1d1d1;
}

/* 직업 필터 버튼 wrapper */
.job-filter-wrapper {
  position: relative;
  display: inline-block;
}

/* 툴팁 스타일 */
.tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: tooltipFadeIn 0.2s ease;
}

.tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-style: solid;
  border-color: transparent transparent rgba(0, 0, 0, 0.75) transparent;
}

/* 클릭 유도 애니메이션 */
.click-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
  z-index: -1;
}

.click-indicator.active {
  animation: pulseRing 1.5s infinite;
  opacity: 1;
}

/* 드래곤 스타일 버튼 */
.job-filter.dragon-button {
  width: 90px;
  height: 34px;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background-image: linear-gradient(to right, rgba(255, 90, 31, 0.05), transparent);
  cursor: pointer;
}

.dragon-button.active {
  background-image: linear-gradient(to right, rgba(255, 90, 31, 0.2), rgba(255, 90, 31, 0.05));
  border-color: #ff5a1f;
  font-weight: 600;
}

.dragon-button.dragon-hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 90, 31, 0.3);
}

/*.filter-icon {
  font-size: 10px;
  margin-left: 4px;
  transition: all 0.3s ease;
}

!* 확장 아이콘 회전 애니메이션 *!
.expand-icon {
  transition: transform 0.5s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}*/

.filter-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 20px;
  height: 20px;
  background-color: #ff5a1f;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(255, 90, 31, 0.5);
  animation: badgeAppear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 2;
}

.default-filter.active {
  border-color: currentColor;
  border-width: 2px;
  font-weight: 600;
}

/* 초기화 모드 스타일 (다른 필터가 선택되었을 때) */
.default-filter.reset-mode {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.default-filter.reset-mode:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(255, 59, 48, 0.3);
}

.default-filter.reset-mode.active {
  animation: pulseLight 2s infinite;
}

@keyframes pulseLight {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4);
  }
  70% {
    box-shadow: 0 0 5px 4px rgba(255, 59, 48, 0.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
  }
}

.filter-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
  position: relative;
  width: 100%;
}

.filter-button {
  width: 80px; /* 원래 크기로 복원 */
  height: 32px; /* 원래 크기로 복원 */
  padding: 0 8px;
  border: 1px solid #d1d1d1; /* 원래 테두리 두께로 복원 */
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    all 0.3s ease,
    color 0.3s ease,
    background-color 0.3s ease,
    border-color 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  z-index: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filter-text {
  position: relative;
  z-index: 1;
}

.filter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--filter-hover-shadow, rgba(0, 0, 0, 0.1));
  border: 1.5px solid var(--filter-hover-border, rgba(0, 0, 0, 0.2));
  background-color: var(--filter-hover-bg, rgba(0, 0, 0, 0.03)) !important;
}

.filter-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.filter-button:hover::before {
  left: 100%;
}

.filter-button.active {
  border-color: currentColor;
  border-width: 1px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6); /* 배경 어둡게 */
  z-index: 9999; /* 매우 높은 z-index 값 */
  display: flex;
  justify-content: center;
  align-items: center; /* 중앙 정렬 */
  padding-top: 0; /* 패딩 제거 */
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;
}

.filter-modal {
  position: relative;
  margin: 0 auto;
  width: 90%;
  max-width: 600px;
  background: var(--bg-color, white);
  border-radius: 12px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 90, 31, 0.3); /* 드래곤 테마 그림자 */
  padding: 24px;
  z-index: 10000; /* backdrop보다 높은 z-index */
  animation: modalFadeIn 0.3s ease;
  transform-origin: center;
  max-height: 80vh; /* 최대 높이 제한 */
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 90, 31, 0.2);
}

.filter-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 90, 31, 0.2);
}

.filter-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ff5a1f;
  background: linear-gradient(90deg, #ff5a1f, #ff8c5a);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 2px rgba(255, 90, 31, 0.1);
}

.modal-close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff5a1f;
  opacity: 0.7;
  transition: all 0.2s ease;
  border-radius: 50%;
}

.modal-close-btn:hover {
  opacity: 1;
  transform: scale(1.3);
}

.filter-modal-content {
  flex: 1;
  overflow-y: auto;
  margin-top: 15px;
  padding-right: 5px;
  max-height: 60vh; /* 최대 높이 제한 */
}

.modal-buttons {
  padding: 10px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 14px;
  width: 100%;
}

/* 애니메이션 */
@keyframes badgeAppear {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes pulseRing {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 90, 31, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 90, 31, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 90, 31, 0);
  }
}

/* 반응형 디자인 지원 */
@media (max-width: 768px) {
  .filter-buttons {
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 8px;
  }

  .filter-button {
    height: 30px;
    font-size: 13px;
    width: 75px;
  }

  .job-filter.dragon-button {
    height: 32px;
    font-size: 13px;
    width: 85px;
  }

  .default-filter {
    height: 30px;
    font-size: 13px;
    width: 75px;
  }

  .filter-modal {
    max-width: 90%;
    margin: 0 auto;
  }

  .filter-modal-backdrop {
    padding-top: 0; /* 모바일에서는 패딩 없앰 */
    align-items: center;
  }
}

@media (max-width: 576px) {
  .filter-buttons {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 6px;
  }

  .filter-button {
    height: 28px;
    font-size: 12px;
    width: 70px;
  }

  .default-filter {
    width: 70px;
    height: 28px;
    font-size: 12px;
  }

  .job-filter.dragon-button {
    width: 80px;
    height: 30px;
    font-size: 12px;
  }

  .filter-header {
    flex-wrap: wrap;
    flex-direction: row; /* 모바일에서도 가로 방향 유지 */
    align-items: center;
    white-space: nowrap;
  }

  .filter-label {
    display: inline-block;
    writing-mode: horizontal-tb;
    text-orientation: mixed;
  }

  .filter-modal {
    width: 95%;
    max-width: 95%;
    padding: 15px;
    margin: 0 auto;
  }

  .filter-modal-backdrop {
    overflow: hidden;
  }

  .modal-buttons {
    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
    gap: 8px;
  }
}
</style>
