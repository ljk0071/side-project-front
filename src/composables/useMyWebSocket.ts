/**
 * WebSocket 연결 관리를 위한 컴포저블
 *
 * StompJS를 사용하여 WebSocket 연결을 관리하고
 * 파티 지원 후 실시간 통신을 위한 기능을 제공합니다.
 */
import { Client, type IMessage } from '@stomp/stompjs'
import { ref, onUnmounted } from 'vue'
import { useAuth } from '@/stores/useAuth.ts'
import SockJS from 'sockjs-client'
import { customAlert, useCustomModal } from '@/composables/useCustomModal.ts'
import { usePartyApplications } from '@/stores/usePartyApplications.ts'
import { defineStore } from 'pinia'
import { usePartyOwner } from '@/stores/usePartyOwner.ts'
import { useResume } from '@/stores/useResume.ts'
import type { PartyApplicationStatusTypeEnum } from '@/types/response.ts'

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  isJoined: boolean;
  error: string | null;
}

interface PartyMessage {
  contents: string;
  deleted: boolean;
  messageId: string;
  partyRecruitId: number;
  senderId: string;
  senderName: string;
  application: boolean;
  statusType: PartyApplicationStatusTypeEnum;
  type: string;
  timestamp: number;
}

const client = ref<Client | null>(null)
const state = ref<WebSocketState>({
  isConnected: false,
  isConnecting: false,
  isJoined: false,
  error: null
})

const withWebSocketCheck = <T extends (...args: any[]) => any>(fn: T): T => {
  return ((...args: Parameters<T>) => {
    if (!client.value) {
      console.warn('WebSocket이 연결되지 않았습니다.')
      return
    }
    return fn(...args)
  }) as T
}

const receivePartyMessage = ref<Array<PartyMessage>>([])

export const useMyWebSocket = () => {
  const auth = useAuth()

  /**
   * WebSocket 연결 설정
   */
  const connect = async () => {
    if (state.value.isConnected || state.value.isConnecting) {
      // console.log('이미 연결되었거나 연결 중입니다.')
      return
    }

    if (!auth.userInfo?.uniqueId) {
      throw new Error('사용자 인증 정보가 없습니다.')
    }

    state.value.isConnecting = true
    state.value.error = null

    try {
      return new Promise((resolve) => {
        // StompJS 클라이언트 생성
        client.value = new Client({
          webSocketFactory: () => new SockJS(`https://maple-party.com/ws`),
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
          onStompError: (frame) => {
            console.error('STOMP 에러:', frame)
            state.value.error = frame.headers['message'] || 'WebSocket 연결 오류'
            state.value.isConnecting = false
            state.value.isConnected = false
          },
          onWebSocketError: (error) => {
            console.error('WebSocket 에러:', error)
            state.value.error = 'WebSocket 연결 실패'
            state.value.isConnecting = false
            state.value.isConnected = false
          },
          onConnect: () => {
            state.value.isConnected = true
            resolve(null)
          },
          onDisconnect: () => {
            // console.log('WebSocket 연결 해제')
            state.value.isConnected = false
            state.value.isConnecting = false
          }
        })

        // 연결 활성화
        client.value.activate()
      })
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      state.value.error = error instanceof Error ? error.message : 'WebSocket 연결 실패'
      state.value.isConnecting = false
    }
  }

  const subscribeNotify = withWebSocketCheck((): void => {
    client.value!.subscribe(`/queue/${useAuth().userInfo.uniqueId}/notification`, (message) => {
      const notification = JSON.parse(message.body)

      if (notification.statusType === 'REJECTED') {
        const resume = useResume()
        const appliedParties = resume.appliedParties
        appliedParties.splice(appliedParties.indexOf(notification.partyRecruitId), 1)
        resume.rejectedParties.push(notification.partyRecruitId)
        customAlert('님 컷 당함')
        return
      }

      joinParty(notification.partyRecruitId)
    })
  })

  const joinParty = withWebSocketCheck((partyRecruitId: number): void => {
    client.value!.publish({ destination: `/chat/${partyRecruitId}/join` })
    subscribeParty(partyRecruitId)
    state.value.isJoined = true
  })

  /**
   * 파티별 토픽 구독
   */
  const subscribeParty = (partyRecruitId: number): void => {
    const party = `/topic/chat/${partyRecruitId}`

    client.value!.subscribe(party, (message: IMessage) => {
      try {
        const partyMessage: PartyMessage = JSON.parse(message.body)

        if (partyMessage.application) {
          const data = JSON.parse(partyMessage.contents)
          const partyApplication = usePartyApplications()
          if (data.application) {
            partyApplication.addApplication(data.application)
          }
          return
        }

        receivePartyMessage.value.push(partyMessage)
      } catch (error) {
        console.error('파티 메시지 파싱 오류:', error)
      }
    })
  }

  /**
   * 메시지 전송
   */
  const sendMessage = withWebSocketCheck((message: string): void => {
    client.value!.publish({
      destination: `/chat/${usePartyOwner().partyRecruitId}/send`,
      body: JSON.stringify({ contents: message })
    })
  })

  /**
   * WebSocket 연결 해제
   */
  const disconnect = (): void => {
    if (client.value) {
      client.value.deactivate()
      client.value = null
    }

    state.value.isConnected = false
    state.value.isConnecting = false
    state.value.isJoined = false
    state.value.error = null
  }

  /**
   * 컴포넌트 언마운트 시 연결 해제
   */
  onUnmounted(() => {
    disconnect()
  })

  return {
    // 상태
    state: state.value,
    isConnected: () => state.value.isConnected,
    isConnecting: () => state.value.isConnecting,
    isJoined: () => state.value.isJoined,
    error: () => state.value.error,

    receivePartyMessage,

    // 메서드
    connect,
    disconnect,
    sendMessage,
    subscribeNotify,
    joinParty
  }
}
