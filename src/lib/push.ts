import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let openConversationId: string | null = null;

/** The thread on screen; its own pushes are not shown as banners while it's open. */
export function setOpenConversation(id: string | null) {
  openConversationId = id;
}

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isOpenThread =
      data?.type === 'new_message' &&
      openConversationId !== null &&
      data.conversation_id === openConversationId;

    return {
      shouldPlaySound: !isOpenThread,
      shouldSetBadge: false,
      shouldShowBanner: !isOpenThread,
      shouldShowList: !isOpenThread,
    };
  },
});

/** Asks for permission and returns this device's Expo push token, or null when unavailable. */
export async function getPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    // Must match the channelId the API sends with every push.
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Kega',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}
