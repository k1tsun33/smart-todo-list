/**
 * Browser Web Notification API and in-app alert utilities
 */
import { soundEngine } from './sound';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export function getBrowserNotificationPermission(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      soundEngine.playNotificationBell();
      new Notification('Notifications activées !', {
        body: 'Vous recevrez des rappels pour vos tâches urgentes et échéances.',
        icon: '/favicon.ico',
      });
    }
    return perm;
  } catch {
    return 'denied';
  }
}

export function triggerSystemNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        badge: '/favicon.ico',
        icon: '/favicon.ico',
        ...options,
      });
      soundEngine.playNotificationBell();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
