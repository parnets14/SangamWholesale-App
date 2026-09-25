/**
 * Local notification store backed by AsyncStorage.
 *
 * Notifications come from two sources:
 *   1. Backend API  — order status changes derived from the orders collection.
 *   2. FCM push     — if firebase is added later, call saveNotification() from
 *                     the foreground/background handlers.
 *
 * Shape of a stored notification:
 * {
 *   id        : string   — unique id (orderId + type, or a uuid)
 *   type      : 'placed' | 'accepted' | 'out_for_delivery' | 'delivered'
 *                       | 'undelivered' | 'return' | 'info'
 *   title     : string
 *   message   : string
 *   orderId   : string | null
 *   createdAt : ISO string
 *   read      : boolean
 * }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = 'udaan_notifications';
const MAX_ITEMS = 100; // keep only the latest N notifications

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadNotifications() {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getUnreadCount() {
  const items = await loadNotifications();
  return items.filter(n => !n.read).length;
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Merge a fresh list from the backend into the local store.
 * Avoids duplicates (same id). Marks items as read if they were read before.
 */
export async function mergeNotifications(incoming = []) {
  const existing = await loadNotifications();
  const readSet = new Set(existing.filter(n => n.read).map(n => n.id));

  // Build a map of existing items so we preserve their read state.
  const existingMap = Object.fromEntries(existing.map(n => [n.id, n]));

  // Merge: incoming items override existing except for the read flag.
  const merged = incoming.map(n => ({
    ...n,
    read: readSet.has(n.id) ? true : (existingMap[n.id]?.read ?? false),
  }));

  // Keep only the latest MAX_ITEMS sorted newest-first.
  const sorted = merged
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, MAX_ITEMS);

  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(sorted));
  return sorted;
}

/**
 * Save a single new notification (e.g. from a FCM push).
 * Deduplicates by id.
 */
export async function saveNotification(notification) {
  const existing = await loadNotifications();
  if (existing.some(n => n.id === notification.id)) return existing;
  const updated = [{ read: false, ...notification }, ...existing].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(updated));
  return updated;
}

// ─── Mark read ────────────────────────────────────────────────────────────────

export async function markAsRead(id) {
  const items = await loadNotifications();
  const updated = items.map(n => (n.id === id ? { ...n, read: true } : n));
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(updated));
  return updated;
}

export async function markAllAsRead() {
  const items = await loadNotifications();
  const updated = items.map(n => ({ ...n, read: true }));
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(updated));
  return updated;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteNotification(id) {
  const items = await loadNotifications();
  const updated = items.filter(n => n.id !== id);
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearAllNotifications() {
  await AsyncStorage.removeItem(STORE_KEY);
  return [];
}
