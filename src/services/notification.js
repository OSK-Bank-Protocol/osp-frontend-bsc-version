import { reactive } from 'vue';

export const notificationState = reactive({
  visible: false,
  message: '',
  timeoutId: null,
});

export function showToast(message, duration = 3000) {
  if (notificationState.timeoutId) {
    clearTimeout(notificationState.timeoutId);
  }

  notificationState.message = message;
  notificationState.visible = true;

  notificationState.timeoutId = setTimeout(() => {
    notificationState.visible = false;
  }, duration);
}
