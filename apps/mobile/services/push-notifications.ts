import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiFetch } from './api';

Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

export async function registerForPushNotifications(authToken: string): Promise<void> {
  const existing = await Notifications.getPermissionsAsync();
  const perm = existing.granted ? existing : await Notifications.requestPermissionsAsync();

  if (!perm.granted) return;

  const pushToken = await Notifications.getExpoPushTokenAsync();
  const platform = Platform.OS;

  const opts: RequestInit & { token?: string } = {
    method: 'POST',
    body: JSON.stringify({ token: pushToken.data, platform }),
  };
  if (authToken) opts.token = authToken;
  await apiFetch('/notifications/device-tokens', opts);
}

export function useNotificationListeners(
  onNotification: (notification: Notifications.Notification) => void,
  onResponse: (response: Notifications.NotificationResponse) => void,
): () => void {
  const sub1 = Notifications.addNotificationReceivedListener(onNotification);
  const sub2 = Notifications.addNotificationResponseReceivedListener(onResponse);
  return () => {
    sub1.remove();
    sub2.remove();
  };
}
