import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
export async function setupReminderChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(
      'reminder',
      {
        name: 'Reminder Channel',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 1000, 500, 1000],
      }
    );
  }
}
export async function scheduleReminder({
  title,
  description,
  date,
}) {
  const permission =
    await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    console.log('Permission denied');
    return;
  }
  const seconds = Math.max(
    1,
    Math.floor((date - Date.now()) / 1000)
  );
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: description,
      sound: 'default',
      priority:
        Notifications.AndroidNotificationPriority.MAX,
      data: { type: 'reminder' },
    },

    trigger: {
      seconds,
      channelId: 'reminder',
    },
  });
}
