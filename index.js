/**
 * @format
 *
 * Background notification rules (mirrors Deliveryapp/index.js):
 *
 * When notification+data arrives and app is killed:
 *  - Android/FCM shows the notification automatically from the notification field.
 *  - The headless task fires — used ONLY for data-only messages or tap nav storage.
 *
 * When app is foregrounded, FCM suppresses notification display —
 *  - push.js listenForegroundMessages handles display via Notifee.
 */

import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

// ─── Headless background task ─────────────────────────────────────────────────
// RN Firebase triggers this for background/killed FCM messages.
AppRegistry.registerHeadlessTask(
  'ReactNativeFirebaseMessagingHeadlessTask',
  () => async remoteMessage => {
    const notifeeModule = require('@notifee/react-native');
    const notifee = notifeeModule.default;
    const {AndroidImportance, EventType} = notifeeModule;
    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;

    const CHANNEL_ID = 'orders';
    const n = remoteMessage?.notification || {};
    const d = remoteMessage?.data || {};

    // Register background tap handler so tapping the system notification
    // stores the orderId for App.jsx to navigate on resume.
    try {
      notifee.onBackgroundEvent(async ({type, detail}) => {
        if (type === EventType.PRESS) {
          const data = detail?.notification?.data || {};
          if (data.orderId) {
            await AsyncStorage.setItem(
              'udaan_pendingNotifNav',
              JSON.stringify({orderId: data.orderId, type: data.type || ''}),
            );
          }
        }
      });
    } catch (_) {}

    // Only show via Notifee if FCM did NOT include a notification field
    // (data-only message). If notification field exists, FCM already
    // showed it — showing again would cause a duplicate.
    if (!n.title && !n.body) {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Order Alerts',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: d.title || 'Order Update',
        body: d.body || 'You have a new update on your order.',
        android: {
          channelId: CHANNEL_ID,
          smallIcon: 'ic_launcher',
          importance: AndroidImportance.HIGH,
          pressAction: {id: 'default'},
        },
        data: d,
      });
    } else {
      // FCM has notification field — it will show automatically.
      // But still create channel in case it's not created yet.
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Order Alerts',
        importance: AndroidImportance.HIGH,
      });
    }
  },
);

// ─── Root component ───────────────────────────────────────────────────────────
AppRegistry.registerComponent(appName, () => App);
