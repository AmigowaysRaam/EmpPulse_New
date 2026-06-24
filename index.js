import messaging from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';
import {
    scheduleReminder,
} from 'react-native-reminder-notifier';
import App from './App';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
// 🔔 Android channel
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm-channel', {
      name: 'Alarm Channel',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
  }
}
setupNotificationChannel();
let defaultCalendarId = null;
// 📅 Create event
async function createCalendarReminder(remoteMessage,scope) {
  try {
    console.log('📅 remoteMessage' ,remoteMessage);
    if (scope !== 'create_event') return false;
    try {
      await scheduleReminder({
        id: 'expo-example-wake-up-call',
        title: remoteMessage?.title || 'Remainder',
        description: remoteMessage?.body || 'Check your App',
        date: Date.now(),
        soundName: 'tone',
        loopSound: true,
        snoozeTime: 10,
      });
    } catch (error) {
      Alert.alert('Schedule failed', String(error));
    }
    return true;
  } catch (e) {
    console.log('❌ Calendar error:', e);
    return false;
  }
}
// 🔔 Show notification
async function showNotification(remoteMessage, created) {
  const title =
    remoteMessage.notification?.title ||
    remoteMessage.data?.title ||
    '';

  const body =
    remoteMessage.notification?.body ||
    remoteMessage.data?.body ||
    '';

  // ✅ Convert "1" → true
  const shouldOpen =
    remoteMessage.data?.openCalendar === '1' && created;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: {
        ...remoteMessage.data,
        openCalendar: shouldOpen,
      },
    },
    trigger: null,
  });
}

// 🧠 Main handler
async function handleMessage(remoteMessage) {
  console.log('📩 Message received:', remoteMessage);
  const created = await createCalendarReminder(remoteMessage?.notification,remoteMessage?.data?.scope);
  await showNotification(remoteMessage, created);
}

// 📩 Foreground
messaging().onMessage(handleMessage);

// 📩 Background / killed
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await handleMessage(remoteMessage);
});

// 📅 Open calendar
async function openCalendarApp() {
  try {
    console.log('📅 Opening calendar');
    if (Platform.OS === 'android') {
      await Linking.openURL('content://com.android.calendar/time/');
    } else {
      await Linking.openURL('calshow:');
    }
  } catch (e) {
    console.log('❌ Failed to open calendar:', e);
  }
}

// 🔔 Notification click (foreground + background)
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;
  if (data?.openCalendar) {
    // openCalendarApp();
  }
});

// 🔥 KILLED STATE FIX
async function checkInitialNotification() {
  const response = await Notifications.getLastNotificationResponseAsync();
  if (response?.notification?.request?.content?.data?.openCalendar) {
    // openCalendarApp();
  }
}
// checkInitialNotification();

// 🚀 App entry
registerRootComponent(App);
