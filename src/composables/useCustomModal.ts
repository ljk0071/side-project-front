/**
 * useCustomModal 컴포저블
 *
 * CustomModal 컴포넌트를 쉽게 사용할 수 있도록 도와주는 컴포저블
 * alert, confirm 기능을 Promise 기반으로 제공
 */
import { ref } from 'vue';

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  iconType?: 'success' | 'error' | 'warning' | 'info';
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  iconType?: 'success' | 'error' | 'warning' | 'info';
}

interface ModalState {
  show: boolean;
  type: 'alert' | 'confirm';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  iconType?: 'success' | 'error' | 'warning' | 'info';
  resolve?: (value: boolean) => void;
}

// 전역 모달 상태
const modalState = ref<ModalState>({
  show: false,
  type: 'alert',
  message: '',
});

// 모달 이벤트 핸들러
const handleConfirm = () => {
  if (modalState.value.resolve) {
    modalState.value.resolve(true);
  }
  closeModal();
};

const handleCancel = () => {
  if (modalState.value.resolve) {
    modalState.value.resolve(false);
  }
  closeModal();
};

const handleClose = () => {
  if (modalState.value.resolve) {
    modalState.value.resolve(false);
  }
  closeModal();
};

const closeModal = () => {
  modalState.value.show = false;
  modalState.value.resolve = undefined;
};

// alert 함수
export const customAlert = (options: AlertOptions | string): Promise<boolean> => {
  const opts = typeof options === 'string' ? { message: options } : options;

  return new Promise((resolve) => {
    modalState.value = {
      show: true,
      type: 'alert',
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || '확인',
      iconType: opts.iconType || 'info',
      resolve,
    };
  });
};

// confirm 함수
export const customConfirm = (options: ConfirmOptions | string): Promise<boolean> => {
  const opts = typeof options === 'string' ? { message: options } : options;

  return new Promise((resolve) => {
    modalState.value = {
      show: true,
      type: 'confirm',
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || '확인',
      cancelText: opts.cancelText || '취소',
      iconType: opts.iconType || 'info',
      resolve,
    };
  });
};

// 성공 메시지 alert
export const customSuccess = (message: string, title?: string): Promise<boolean> => {
  return customAlert({
    title: title || '성공',
    message,
    iconType: 'success',
  });
};

// 에러 메시지 alert
export const customError = (message: string, title?: string): Promise<boolean> => {
  return customAlert({
    title: title || '오류',
    message,
    iconType: 'error',
  });
};

// 경고 메시지 alert
export const customWarning = (message: string, title?: string): Promise<boolean> => {
  return customAlert({
    title: title || '경고',
    message,
    iconType: 'warning',
  });
};

// 정보 메시지 alert
export const customInfo = (message: string, title?: string): Promise<boolean> => {
  return customAlert({
    title: title || '정보',
    message,
    iconType: 'info',
  });
};

// 컴포저블 함수
export const useCustomModal = () => {
  return {
    modalState,
    handleConfirm,
    handleCancel,
    handleClose,
    customAlert,
    customConfirm,
    customSuccess,
    customError,
    customWarning,
    customInfo,
  };
};

// 전역 타입 선언
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $customAlert: typeof customAlert;
    $customConfirm: typeof customConfirm;
    $customSuccess: typeof customSuccess;
    $customError: typeof customError;
    $customWarning: typeof customWarning;
    $customInfo: typeof customInfo;
  }
}
