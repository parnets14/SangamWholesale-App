import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import axios from 'axios';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
import {ENDPOINTS} from '../config/api';
import {
  mergeNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  loadNotifications,
} from '../utils/notificationStore';

// ─── Type metadata ─────────────────────────────────────────────────────────────
const TYPE_META = {
  placed:           {icon: 'shopping-bag', color: '#3E7BFA', bg: '#EEF3FF'},
  accepted:         {icon: 'check-circle',  color: '#7C3AED', bg: '#F3EEFF'},
  out_for_delivery: {icon: 'truck',         color: '#F59E0B', bg: '#FFF8EC'},
  delivered:        {icon: 'package',       color: '#2E9E5B', bg: '#EDFAF3'},
  undelivered:      {icon: 'x-circle',      color: '#E5484D', bg: '#FFF0F0'},
  cancelled:        {icon: 'slash',         color: '#6F767E', bg: '#F4F5F6'},
  info:             {icon: 'bell',          color: '#7B2533', bg: '#FDF0F2'},
};

const getMeta = type => TYPE_META[type] || TYPE_META.info;

// ─── Group by date label ───────────────────────────────────────────────────────
function groupByDate(items) {
  const groups = {};
  items.forEach(item => {
    const d = moment(item.createdAt);
    let label;
    if (d.isSame(moment(), 'day')) label = 'Today';
    else if (d.isSame(moment().subtract(1, 'day'), 'day')) label = 'Yesterday';
    else label = d.format('DD MMM YYYY');
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });
  // Return as a flat list with section headers interspersed
  const result = [];
  Object.entries(groups).forEach(([label, notifs]) => {
    result.push({type: 'header', label, id: `header_${label}`});
    notifs.forEach(n => result.push({type: 'item', ...n}));
  });
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────
const NotificationsScreen = () => {
  const navigation = useNavigation();
  const {token} = useAuth();
  const {theme} = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = items.filter(n => n.type === 'item' && !n.read).length;

  const load = useCallback(async ({silent = false} = {}) => {
    if (!silent) setLoading(true);
    try {
      // Fetch from backend
      const res = await axios.get(ENDPOINTS.USER_NOTIFICATIONS, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const incoming = res.data.notifications || [];
      // Merge with local store (preserves read state)
      const merged = await mergeNotifications(incoming);
      setItems(merged);
    } catch {
      // Backend unreachable — show what we have locally
      const local = await loadNotifications();
      setItems(local);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  // Reload every time screen is focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load({silent: true});
    setRefreshing(false);
  }, [load]);

  const handleMarkAllRead = useCallback(async () => {
    const updated = await markAllAsRead();
    setItems(updated);
  }, []);

  const handleMarkRead = useCallback(async id => {
    const updated = await markAsRead(id);
    setItems(updated);
  }, []);

  const handleDelete = useCallback(async id => {
    const updated = await deleteNotification(id);
    setItems(updated);
  }, []);

  const handlePress = useCallback(async item => {
    if (!item.read) await handleMarkRead(item.id);
    if (item.orderId) {
      navigation.navigate('Deliveries');
    }
  }, [handleMarkRead, navigation]);

  // Build flat data for FlatList (headers + items)
  const listData = groupByDate(items);

  const renderRow = ({item}) => {
    if (item.type === 'header') {
      return <Text style={[styles.dateHeader, {color: theme.textColor + '99'}]}>{item.label}</Text>;
    }

    const {icon, color, bg} = getMeta(item.type);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handlePress(item)}
        style={[
          styles.card,
          {backgroundColor: theme.cardBackground},
          !item.read && styles.cardUnread,
        ]}>
        {/* Unread dot */}
        {!item.read && <View style={[styles.unreadDot, {backgroundColor: '#7B2533'}]} />}

        {/* Icon */}
        <View style={[styles.iconWrap, {backgroundColor: bg}]}>
          <Icon name={icon} size={20} color={color} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, {color: theme.textColor}]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{moment(item.createdAt).fromNow()}</Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          style={styles.deleteBtn}>
          <Icon name="x" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundColor}]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.headerBackground}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7B2533" />
        </View>
      ) : listData.length === 0 ? (
        <View style={styles.center}>
          <Icon name="bell-off" size={52} color="#D1D5DB" />
          <Text style={[styles.emptyTitle, {color: theme.textColor}]}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>Your order updates will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderRow}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7B2533']}
              tintColor="#7B2533"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {width: 36, alignItems: 'flex-start'},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center'},
  markAllBtn: {width: 80, alignItems: 'flex-end'},
  markAllText: {fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)'},

  // List
  list: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40},

  // Date header
  dateHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#7B2533',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 42,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  content: {flex: 1},
  title: {fontSize: 14, fontWeight: '700', marginBottom: 3},
  message: {fontSize: 13, color: '#6B7280', lineHeight: 18},
  time: {fontSize: 11, color: '#9CA3AF', marginTop: 5},
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    flexShrink: 0,
  },

  // States
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60},
  emptyTitle: {fontSize: 17, fontWeight: '600', marginTop: 16},
  emptySubtitle: {fontSize: 13, color: '#9CA3AF', marginTop: 6},
});

export default NotificationsScreen;
