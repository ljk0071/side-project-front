<script lang="ts" setup>
/**
 * ApplicationHistory 컴포넌트
 *
 * 지원서 제출 내역을 스택 형식으로 표시하는 사이드바 컴포넌트입니다.
 * 사용자가 제출한 지원서들의 상태와 내용을 보여줍니다.
 */
import { computed, ref, Teleport } from 'vue'
import ApplicationHistoryModal from './ApplicationHistoryModal.vue'
import type { PartyApplicationStatusTypeEnum } from '@/types/response.ts'
import { customSuccess } from '@/composables/useCustomModal.ts'
import { usePartyApplications } from '@/stores/usePartyApplications.ts'
import dayjs from 'dayjs'
import { kyWithCustom } from '@/utils/ky/kyWithCustom.ts'
import { useMyWebSocket } from '@/composables/useMyWebSocket.ts'

// 이벤트 정의
interface Emits {
  (e: 'open-full-view'): void;
}

const emit = defineEmits<Emits>()

// 모달 상태
const showFullModal = ref(false)
const partyApplications = usePartyApplications()
const applications = computed(() => partyApplications.applications)

// 상태별 한글 텍스트
const statusText: Record<PartyApplicationStatusTypeEnum, string> = {
  PENDING: '대기중',
  ACCEPTED: '승인됨',
  REJECTED: '거절됨',
  CANCELLED: '취소됨'
}

// 상태별 색상
const statusColor: Record<PartyApplicationStatusTypeEnum, string> = {
  PENDING: '#ffc107',
  ACCEPTED: '#28a745',
  REJECTED: '#dc3545',
  CANCELLED: '#8c8c8c'
}

/**
 * 내용 일부만 표시하는 함수
 */
const truncateContent = (contents: string = '', maxLength: number = 50) => {
  return contents.length > maxLength ? contents.substring(0, maxLength) + '...' : contents
}

/**
 * 전체보기 모달 열기
 */
const openFullView = () => {
  // 드래그 중이 아닐 때만 모달 열기
  if (!isDragging.value) {
    // 드래그 관련 상태 완전 초기화
    position.value = { x: 0, y: 0 }
    isDragging.value = false

    // 모달 열기
    showFullModal.value = true
  }
}

/**
 * 전체보기 모달 닫기
 */
const closeFullView = () => {
  showFullModal.value = false
  // 모달 닫을 때 드래그 위치 초기화
  position.value = { x: 0, y: 0 }
  isDragging.value = false
}

/**
 * 지원서 승인 처리
 */
const approveApplication = async (applicationId: number) => {
  const application = applications.value.find((app) => app.id === applicationId)
  if (application) {
    await kyWithCustom(
      'patch',
      `v1/party/application/${applicationId}/ACCEPTED?partyRecruitId=${application.partyRecruit.id}`
    )
    application.status = 'ACCEPTED'
    customSuccess(`지원서가 승인되었습니다.`)
  }
}

/**
 * 지원서 거절 처리
 */
const rejectApplication = async (applicationId: number) => {
  await kyWithCustom('patch', `v1/party/application/${applicationId}/REJECTED`)
  const application = applications.value.find((app) => app.id === applicationId)
  if (application) {
    application.status = 'REJECTED'
    customSuccess(`컷!!!!!`)
  }
}

const formatTimeAgo = (createdAt: number) => {
  const now = dayjs()
  const created = dayjs(createdAt * 1000) // 초 단위를 밀리초로 변환
  const diffMinutes = now.diff(created, 'minute')

  if (diffMinutes < 1) {
    return '방금 전'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  } else if (diffMinutes < 1440) {
    // 24시간
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours}시간 전`
  } else if (diffMinutes < 10080) {
    // 7일
    const diffDays = Math.floor(diffMinutes / 1440)
    return `${diffDays}일 전`
  } else {
    return created.format('YYYY-MM-DD')
  }
}

/**
 * 드래그 관련 상태와 함수들
 */
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const position = ref({ x: 0, y: 0 })
const applicationHistoryRef = ref<HTMLElement | null>(null)

// 원래 크기 저장
const originalSize = ref({ width: 0, height: 0 })

/**
 * 마우스 드래그 시작
 */
const onMouseDown = (event: MouseEvent) => {
  // 전체보기 버튼 클릭 시에는 드래그 시작하지 않음
  if ((event.target as HTMLElement).closest('.view-all-button')) {
    return
  }

  isDragging.value = true
  const rect = applicationHistoryRef.value?.getBoundingClientRect()
  if (rect) {
    // 원래 크기 저장
    originalSize.value = {
      width: rect.width,
      height: rect.height
    }

    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  event.preventDefault()
}

/**
 * 마우스 드래그 중
 */
const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return

  position.value = {
    x: event.clientX - dragOffset.value.x,
    y: event.clientY - dragOffset.value.y
  }
}

/**
 * 마우스 드래그 종료
 */
const onMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

/**
 * 드래그 스타일 계산
 */
const dragStyle = computed(() => {
  // 모달이 열려있을 때는 드래그 스타일 적용하지 않음
  if (showFullModal.value) {
    return {}
  }

  if (position.value.x === 0 && position.value.y === 0) {
    return {}
  }

  return {
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    zIndex: 1000,
    transform: 'none',
    width: `${originalSize.value.width}px`,
    height: `${originalSize.value.height}px`,
    maxHeight: 'none', // 드래그 중에는 최대 높이 제한 해제
    minHeight: 'unset' // 최소 높이 제한 해제
  }
})

// HTML5 드래그 이벤트 방지
const onDragStart = (event: DragEvent) => {
  event.preventDefault()
}
</script>

<template>
  <div
    ref="applicationHistoryRef"
    :class="{ dragging: isDragging }"
    :style="dragStyle"
    class="application-history"
    @dragstart="onDragStart"
    @mousedown="onMouseDown"
  >
    <div class="history-header">
      <h3>지원서 내역</h3>
      <span class="total-count">{{ applications.length }}건</span>
    </div>

    <div class="history-list">
      <div
        v-for="application in applications"
        :key="application.id"
        :class="`status-${application.status}`"
        class="application-item"
      >
        <div class="item-header">
          <div :style="{ backgroundColor: statusColor[application.status] }" class="status-badge">
            {{ statusText[application.status] }}
          </div>
        </div>

        <div class="item-content">
          {{ truncateContent(application.resume.contents) }}
        </div>

        <div class="item-footer">
          <span class="submitted-time">{{ formatTimeAgo(application.metadata.createdAt) }}</span>
          <!-- 대기중인 지원서에 승인/거절 버튼 추가 -->
          <div v-if="application.status === 'PENDING'" class="action-buttons">
            <button class="approve-button" @click="approveApplication(application.id)">승인</button>
            <button class="reject-button" @click="rejectApplication(application.id)">거절</button>
          </div>
        </div>
      </div>
    </div>

    <div class="history-footer">
      <button class="view-all-button" @click.stop="openFullView">전체보기</button>
    </div>

    <!-- 전체보기 모달 - Teleport로 body에 직접 렌더링 -->
    <Teleport to="body">
      <ApplicationHistoryModal :show="showFullModal" @close="closeFullView" />
    </Teleport>
  </div>
</template>

<style scoped>
.application-history {
  width: 450px;
  background-color: var(--card-bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 450px;
  min-height: 450px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  cursor: grab;
  transition: transform 0.2s ease,
  box-shadow 0.2s ease;
}

.application-history:active {
  cursor: grabbing;
}

.application-history:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.application-history.dragging {
  cursor: grabbing;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transform: rotate(-2deg);
  user-select: none;
}

.history-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-bg-color);
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-color);
}

.total-count {
  font-size: 12px;
  color: var(--card-description-color);
  background-color: var(--bg-color);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.application-item {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.application-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color, #3366cc);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.party-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  font-size: 16px;
}

.status-badge {
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}

.item-content {
  font-size: 12px;
  color: var(--card-description-color);
  line-height: 1.4;
  margin-bottom: 8px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.submitted-time {
  font-size: 11px;
  color: var(--card-description-color);
  opacity: 0.7;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.approve-button {
  padding: 4px 8px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

.reject-button {
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reject-button:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.history-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
}

.view-all-button {
  width: 100%;
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-button:hover {
  background-color: var(--primary-color, #3366cc);
  color: white;
  border-color: var(--primary-color, #3366cc);
}

/* 상태별 특별 스타일 */
.application-item.status-accepted {
  border-left: 3px solid #28a745;
}

.application-item.status-rejected {
  border-left: 3px solid #dc3545;
}

.application-item.status-pending {
  border-left: 3px solid #ffc107;
}

/* 스크롤바 스타일 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: var(--card-description-color);
}

/* 모바일 반응형 */
@media (max-width: 1200px) {
  .application-history {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .application-history {
    display: none;
  }
}
</style>
