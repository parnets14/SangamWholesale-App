/**
 * Push notification service for Udaan-APP (customer app).
 * @react-native-firebase/messaging v21 (namespaced API) + Notifee.
 *
 * Handles:
 *  - Notification permission request (Android 13+)
 *  - FCM token registration with backend
 *  - Foreground message display via Notifee
 *  - Foreground tap navigation via notifee.onForegroundEvent
 *  - Background tap navigation via FCM onNotificationOpenedApp
 *  - Killed-state tap navigation via getInitialNotification
 *  - Saving received notifications to local store
 */

import {Platform, PermissionsAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../config/api';
import {saveNotification} from '../utils/notificationStore';

// Safely require native modules — they may not be linked in all builds
let notifee = null;
let AndroidImportance = {};
let EventType = {};
let messaging = null;

try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  AndroidImportance = notifeeModule.AndroidImportance;
  EventType = notifeeModule.EventType;
} catch (_) {
  console.warn('[push] @notifee/react-native not available');
}

try {
  // v21 namespaced API — default export is the messaging instance factory
  messaging = require('@react-native-firebase/messaging').default;
} catch (_) {
  console.warn('[push] @react-native-firebase/messaging not available');
}

const CHANNEL_ID = 'orders';

// ─── Channel ──────────────────────────────────────────────────────────────────

export async function ensureChannel() {
  if (!notifee) return;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Order Alerts',
    importance: AndroidImportance.HIGH,
  });
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
      return 'denied';
    }
    if (!messaging) return 'denied';
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

// ─── FCM Token ────────────────────────────────────────────────────────────────

/**
 * Get FCM token and send to backend.
 * Call after login when authToken is available.
 */
export async function registerFcmToken(authToken) {
  try {
    if (!messaging) return;
    const fcmToken = await messaging().getToken();
    if (!fcmToken || !authToken) return;
    console.log('[push] FCM token:', fcmToken.substring(0, 30) + '...');
    await AsyncStorage.setItem('udaan_fcmToken', fcmToken);
    await axios.post(
      `${BASE_URL}/user/fcm-token`,
      {fcmToken},
      {headers: {Authorization: `Bearer ${authToken}`}},
    );
    console.log('[push] FCM token registered with backend ✓');
  } catch (e) {
    console.warn('[push] registerFcmToken error:', e.message);
  }
}

export function listenTokenRefresh(authToken) {
  if (!messaging) return () => {};
  return messaging().onTokenRefresh(async fcmToken => {
    try {
      await axios.post(
        `${BASE_URL}/user/fcm-token`,
        {fcmToken},
        {headers: {Authorization: `Bearer ${authToken}`}},
      );
    } catch (_) {}
  });
}

// ─── Display ──────────────────────────────────────────────────────────────────

async function displayAndStore(remoteMessage) {
  const n = remoteMessage?.notification || {};
  const d = remoteMessage?.data || {};
  const title = n.title || d.title || 'Order Update';
  const body = n.body || d.body || 'You have a new update.';

  if (notifee) {
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: {id: 'default'},
      },
      data: d,
    });
  }

  await saveNotification({
    id: `push_${Date.now()}`,
    type: d.type || 'info',
    title,
    message: body,
    orderId: d.orderId || null,
    createdAt: new Date().toISOString(),
  });
}

// ─── Navigation helper ────────────────────────────────────────────────────────

let _navigate = null;

export function setNavigator(navigateFn) {
  _navigate = navigateFn;
}

function handleTap(data) {
  if (!_navigate || !data) return;
  _navigate('Notifications');
}

// ─── Foreground listeners ─────────────────────────────────────────────────────

export function listenForegroundMessages() {
  if (!messaging) return () => {};
  return messaging().onMessage(async remoteMessage => {
    await displayAndStore(remoteMessage);
  });
}

export function listenForegroundNotifTaps() {
  if (!notifee) return () => {};
  return notifee.onForegroundEvent(({type, detail}) => {
    if (type === EventType.PRESS) {
      handleTap(detail?.notification?.data);
    }
  });
}

export function listenBackgroundNotifTaps() {
  if (!messaging) return () => {};
  return messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage?.data) handleTap(remoteMessage.data);
  });
}

export async function checkInitialNotification() {
  try {
    if (!messaging) return null;
    const msg = await messaging().getInitialNotification();
    return msg ?? null;
  } catch {
    return null;
  }
}
