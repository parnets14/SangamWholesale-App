import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Alert,
  Image,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const API_ORDERS = 'https://sangamwholesale.com/api/orders/';
const API_RETURNS = 'https://sangamwholesale.com/api/return-orders';

const STATUS_COLORS = {
  pending:    {color: '#F59E0B', bg: '#FEF3C7'},
  approved:   {color: '#10B981', bg: '#D1FAE5'},
  rejected:   {color: '#EF4444', bg: '#FEE2E2'},
  completed:  {color: '#6366F1', bg: '#EEF2FF'},
  processing: {color: '#3B82F6', bg: '#DBEAFE'},
};
const ORDER_STATUS_COLORS = {
  pending:   '#F59E0B',
  confirmed: '#3B82F6',
  shipped:   '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const REASONS = [
  'Damaged / Defective',
  'Wrong item',
  'Expired product',
  'Quality issue',
  'Excess quantity',
  'Other',
];

export default function ReturnsScreen() {
  const navigation = useNavigation();
  const {token} = useAuth();

  const [returnOrders, setReturnOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadReturns();
    }, [token]),
  );

  const loadReturns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_RETURNS, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const data = await res.json();
      const list = data.returnOrders || data.returns || [];
      setReturnOrders(list);
    } catch (e) {
      setError('Failed to load. Tap to retry.');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        fetch(API_ORDERS, {headers: {Authorization: `Bearer ${token}`}}),
        fetch(API_RETURNS, {headers: {Authorization: `Bearer ${token}`}}),
      ]);
      const ordersData = await ordersRes.json();
      const returnsData = await returnsRes.json();

      const returnList = returnsData.returnOrders || returnsData.returns || [];
      // Only block re-return if status is NOT rejected
      const returnedIds = new Set(
        returnList
          .filter(r => r.status?.toLowerCase() !== 'rejected')
          .map(r => r.order?._id || r.order),
      );

      const allOrders = ordersData.orders || [];
      // Show all orders that don't already have a return
      const eligible = allOrders.filter(o => !returnedIds.has(o._id));
      setOrders(eligible);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const openModal = () => {
    setStep(1);
    setSelectedOrder(null);
    setSelectedItems([]);
    setComment('');
    setModalVisible(true);
    loadOrders();
  };

  const selectOrder = order => {
    setSelectedOrder(order);
    setSelectedItems(order.items.map(i => ({...i, selected: true, reason: ''})));
    setStep(2);
  };

  const toggleItem = i => {
    const copy = [...selectedItems];
    copy[i] = {...copy[i], selected: !copy[i].selected};
    setSelectedItems(copy);
  };

  const setReason = (i, reason) => {
    const copy = [...selectedItems];
    copy[i] = {...copy[i], reason};
    setSelectedItems(copy);
  };

  const submitReturn = async () => {
    const toReturn = selectedItems.filter(i => i.selected);
    if (!toReturn.length) {
      Alert.alert('', 'Select at least one item.');
      return;
    }
    if (toReturn.some(i => !i.reason)) {
      Alert.alert('', 'Select a reason for each item.');
      return;
    }
    if (toReturn.some(i => i.reason === 'Other' && !i.otherText?.trim())) {
      Alert.alert('', 'Please describe the reason for items marked "Other".');
      return;
    }
    setPosting(true);
    try {
      const res = await fetch(API_RETURNS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          items: toReturn.map(({productId, name, image, quantity, reason, otherText}) => ({
            productId, name, image, quantity,
            reason: reason === 'Other' ? otherText.trim() : reason,
          })),
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalVisible(false);
        setSuccessVisible(true);
        loadReturns();
      } else {
        Alert.alert('Failed', data.message || 'Try again.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Try again.');
    } finally {
      setPosting(false);
    }
  };

  /* --- Render: return card ------------------------------------------- */
  const ReturnCard = ({item}) => {
    const sc = STATUS_COLORS[item.status?.toLowerCase()] || STATUS_COLORS.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardLabel}>Return Request</Text>
            <Text style={styles.cardId}>#{item._id?.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, {backgroundColor: sc.bg}]}>
            <Text style={[styles.badgeText, {color: sc.color}]}>
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <Icon name="shopping-bag" size={13} color="#6B7280" />
          <Text style={styles.cardMetaText}>
            Order: {item.order?.orderId || item.order}
          </Text>
        </View>
        <View style={styles.cardMeta}>
          <Icon name="calendar" size={13} color="#6B7280" />
          <Text style={styles.cardMetaText}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
              : ''}
          </Text>
        </View>

        <View style={styles.hr} />
        <Text style={styles.itemsTitle}>Items</Text>

        {/* Rejection reason banner */}
        {item.status?.toLowerCase() === 'rejected' && (
          <View style={styles.rejectionBanner}>
            <Icon name="alert-circle" size={15} color="#EF4444" />
            <Text style={styles.rejectionText}>
              Rejected{item.rejectionReason ? `: ${item.rejectionReason}` : '. You can re-submit below.'}
            </Text>
          </View>
        )}

        {(item.items || []).map((p, i) => (
          <View key={i} style={styles.productRow}>
            {p.image ? (
              <Image
                source={{uri: `https://sangamwholesale.com/products/${p.image}`}}
                style={styles.productImg}
              />
            ) : (
              <View style={[styles.productImg, styles.imgFallback]}>
                <Icon name="package" size={16} color="#9CA3AF" />
              </View>
            )}
            <View style={{flex: 1}}>
              <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.productQty}>Qty: {p.quantity}</Text>
              <View style={styles.reasonPill}>
                <Text style={styles.reasonPillText}>{p.reason}</Text>
              </View>
            </View>
          </View>
        ))}

        {!!item.comment && (
          <View style={styles.commentRow}>
            <Icon name="message-circle" size={13} color="#6B7280" />
            <Text style={styles.commentRowText}>{item.comment}</Text>
          </View>
        )}

        {/* Re-submit button for rejected returns */}
        {item.status?.toLowerCase() === 'rejected' && (
          <TouchableOpacity
            style={styles.resubmitBtn}
            onPress={openModal}
            activeOpacity={0.8}>
            <Icon name="refresh-cw" size={15} color="#fff" />
            <Text style={styles.resubmitBtnTxt}>Re-submit Return</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* --- Render: order list (step 1) ----------------------------------- */
  const OrderRow = ({item}) => {
    const sc = ORDER_STATUS_COLORS[item.status?.toLowerCase()] || '#6B7280';
    return (
      <TouchableOpacity style={styles.orderRow} onPress={() => selectOrder(item)} activeOpacity={0.75}>
        <View style={[styles.orderIcon, {backgroundColor: '#FEE2E2'}]}>
          <Icon name="shopping-bag" size={18} color="#7B2533" />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.orderRowId}>Order #{item.orderId}</Text>
          <Text style={styles.orderRowSub}>
            {item.items?.length} item{item.items?.length !== 1 ? 's' : ''}
            {item.total ? ` · \u20B9${item.total.toLocaleString()}` : ''}
          </Text>
          {item.createdAt && (
            <Text style={styles.orderRowDate}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </Text>
          )}
        </View>
        <View style={styles.orderRowRight}>
          <View style={[styles.dot, {backgroundColor: sc}]} />
          <Text style={[styles.orderStatusTxt, {color: sc}]}>{item.status}</Text>
          <Icon name="chevron-right" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  /* --- Render: item selector (step 2) -------------------------------- */
  const ItemSelector = ({item, index}) => (
    <View style={[styles.itemBox, item.selected && styles.itemBoxActive]}>
      <View style={styles.itemBoxTop}>
        <TouchableOpacity
          style={[styles.cb, item.selected && styles.cbChecked]}
          onPress={() => toggleItem(index)}>
          {item.selected && <Icon name="check" size={11} color="#fff" />}
        </TouchableOpacity>
        {item.image ? (
          <Image
            source={{uri: `https://sangamwholesale.com/products/${item.image}`}}
            style={styles.itemBoxImg}
          />
        ) : (
          <View style={[styles.itemBoxImg, styles.imgFallback]}>
            <Icon name="package" size={15} color="#9CA3AF" />
          </View>
        )}
        <View style={{flex: 1}}>
          <Text style={styles.itemBoxName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemBoxQty}>Qty: {item.quantity}</Text>
        </View>
      </View>
      {item.selected && (
        <View style={styles.reasonWrap}>
          <Text style={styles.reasonLabel}>Reason *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {REASONS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, item.reason === r && styles.chipOn]}
                onPress={() => setReason(index, r)}>
                <Text style={[styles.chipTxt, item.reason === r && styles.chipTxtOn]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {item.reason === 'Other' && (
            <TextInput
              style={styles.otherInput}
              placeholder="Please describe the reason..."
              placeholderTextColor="#9CA3AF"
              value={item.otherText || ''}
              onChangeText={text => {
                const copy = [...selectedItems];
                copy[index] = {...copy[index], otherText: text};
                setSelectedItems(copy);
              }}
              multiline
            />
          )}
        </View>
      )}
    </View>
  );

  /* --- Modal body ---------------------------------------------------- */
  const ModalBody = () => (
    <View style={styles.sheet}>
      {/* sheet header */}
      <View style={styles.sheetHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {step === 2 && (
            <TouchableOpacity onPress={() => setStep(1)} style={{marginRight: 10}}>
              <Icon name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.sheetTitle}>
            {step === 1 ? 'Select an Order' : 'Select Items & Reason'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(false)}>
          <Icon name="x" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* body */}
      {loadingOrders ? (
        <View style={styles.sheetCenter}>
          <ActivityIndicator size="large" color="#7B2533" />
          <Text style={styles.sheetCenterTxt}>Loading your orders?</Text>
        </View>
      ) : step === 1 ? (
        orders.length === 0 ? (
          <View style={styles.sheetCenter}>
            <Icon name="inbox" size={52} color="#D1D5DB" />
            <Text style={styles.sheetEmptyTitle}>No orders found</Text>
            <Text style={styles.sheetEmptyTxt}>
              You don't have any orders eligible for return yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={o => o._id}
            renderItem={({item}) => <OrderRow item={item} />}
            contentContainerStyle={{padding: 16, paddingBottom: 40}}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <ScrollView
          contentContainerStyle={{padding: 16, paddingBottom: 60}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.step2Heading}>
            Order #{selectedOrder?.orderId}
          </Text>
          {selectedItems.map((item, i) => (
            <ItemSelector key={i} item={item} index={i} />
          ))}
          <TextInput
            style={styles.commentInput}
            placeholder="Additional comments (optional)"
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[styles.submitBtn, posting && {opacity: 0.6}]}
            onPress={submitReturn}
            disabled={posting}
            activeOpacity={0.85}>
            {posting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.submitBtnTxt}>Submit Return Request</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  /* --- Main ---------------------------------------------------------- */
  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 4}}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Returns & Refunds</Text>
          <TouchableOpacity style={styles.newBtn} onPress={openModal}>
            <Icon name="plus" size={16} color="#7B2533" />
            <Text style={styles.newBtnTxt}>New</Text>
          </TouchableOpacity>
        </View>

        {/* body */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#7B2533" />
          </View>
        ) : error ? (
          <TouchableOpacity style={styles.center} onPress={loadReturns}>
            <Icon name="alert-circle" size={44} color="#EF4444" />
            <Text style={styles.errTxt}>{error}</Text>
            <Text style={styles.retryTxt}>Tap to retry</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={returnOrders}
            keyExtractor={i => i._id}
            renderItem={({item}) => <ReturnCard item={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icon name="rotate-ccw" size={56} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No returns yet</Text>
                <Text style={styles.emptyTxt}>
                  Tap "New" to create a return request for any order.
                </Text>
              </View>
            }
          />
        )}

        {/* Create return modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.overlayBg} onPress={() => setModalVisible(false)} />
            <ModalBody />
          </View>
        </Modal>

        {/* Success modal */}
        <Modal
          visible={successVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSuccessVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.successCard}>
              <View style={styles.successCircle}>
                <Icon name="check" size={34} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Request Submitted!</Text>
              <Text style={styles.successTxt}>
                We've received your return request and will review it shortly.
              </Text>
              <TouchableOpacity
                style={styles.successBtn}
                onPress={() => setSuccessVisible(false)}>
                <Text style={styles.successBtnTxt}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F3F4F6'},

  header: {
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {flex: 1, fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 8},
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  newBtnTxt: {color: '#7B2533', fontWeight: '700', fontSize: 14, marginLeft: 4},

  list: {padding: 16, paddingBottom: 40, flexGrow: 1},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  errTxt: {fontSize: 15, color: '#374151', marginTop: 10, textAlign: 'center'},
  retryTxt: {fontSize: 13, color: '#7B2533', marginTop: 6, fontWeight: '600'},
  empty: {alignItems: 'center', paddingTop: 80, paddingHorizontal: 40},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8},
  emptyTxt: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22},

  // Return card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10},
  cardLabel: {fontSize: 11, color: '#9CA3AF', fontWeight: '500'},
  cardId: {fontSize: 16, fontWeight: '700', color: '#111827'},
  badge: {borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5},
  badgeText: {fontSize: 12, fontWeight: '700'},
  cardMeta: {flexDirection: 'row', alignItems: 'center', marginBottom: 3},
  cardMetaText: {fontSize: 13, color: '#6B7280', marginLeft: 6},
  hr: {height: 1, backgroundColor: '#F3F4F6', marginVertical: 12},
  itemsTitle: {fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10},
  productRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10},
  productImg: {width: 44, height: 44, borderRadius: 8, marginRight: 10, backgroundColor: '#F3F4F6'},
  imgFallback: {justifyContent: 'center', alignItems: 'center'},
  productName: {fontSize: 14, fontWeight: '600', color: '#111827'},
  productQty: {fontSize: 12, color: '#6B7280', marginTop: 2},
  reasonPill: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: '#FEF3C7', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  reasonPillText: {fontSize: 11, color: '#92400E', fontWeight: '500'},
  commentRow: {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginTop: 6},
  commentRowText: {fontSize: 13, color: '#6B7280', marginLeft: 6, flex: 1},
  rejectionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  rejectionText: {fontSize: 13, color: '#EF4444', marginLeft: 6, flex: 1, fontWeight: '500'},
  resubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B2533',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  resubmitBtnTxt: {color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 8},

  // Order row
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderIcon: {width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12},
  orderRowId: {fontSize: 15, fontWeight: '700', color: '#111827'},
  orderRowSub: {fontSize: 13, color: '#6B7280', marginTop: 2},
  orderRowDate: {fontSize: 12, color: '#9CA3AF', marginTop: 2},
  orderRowRight: {alignItems: 'center', minWidth: 60},
  dot: {width: 8, height: 8, borderRadius: 4, marginBottom: 3},
  orderStatusTxt: {fontSize: 11, fontWeight: '600', marginBottom: 3, textTransform: 'capitalize'},

  // Item selector
  itemBox: {
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 12, marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  itemBoxActive: {borderColor: '#7B2533', backgroundColor: '#FFF5F5'},
  itemBoxTop: {flexDirection: 'row', alignItems: 'center'},
  cb: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#D1D5DB',
    marginRight: 10, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  cbChecked: {backgroundColor: '#7B2533', borderColor: '#7B2533'},
  itemBoxImg: {width: 44, height: 44, borderRadius: 8, marginRight: 10, backgroundColor: '#E5E7EB'},
  itemBoxName: {fontSize: 14, fontWeight: '600', color: '#111827'},
  itemBoxQty: {fontSize: 12, color: '#6B7280', marginTop: 2},
  reasonWrap: {marginTop: 10},
  reasonLabel: {fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6},
  chip: {
    borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    marginRight: 8, backgroundColor: '#fff',
  },
  chipOn: {backgroundColor: '#7B2533', borderColor: '#7B2533'},
  chipTxt: {fontSize: 12, color: '#374151'},
  chipTxtOn: {color: '#fff', fontWeight: '600'},
  otherInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#fff',
    marginTop: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  commentInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#111827',
    backgroundColor: '#F9FAFB', marginTop: 12, marginBottom: 16,
    textAlignVertical: 'top', minHeight: 80,
  },
  submitBtn: {
    backgroundColor: '#7B2533', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
  },
  submitBtnTxt: {color: '#fff', fontWeight: '700', fontSize: 16},

  // Sheet (bottom modal)
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayBg: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  sheetHeader: {
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetTitle: {fontSize: 18, fontWeight: '700', color: '#fff'},
  sheetCenter: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32},
  sheetCenterTxt: {fontSize: 14, color: '#6B7280', marginTop: 12},
  sheetEmptyTitle: {fontSize: 17, fontWeight: '700', color: '#374151', marginTop: 14, marginBottom: 6},
  sheetEmptyTxt: {fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22},
  step2Heading: {fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 14},

  // Success modal
  successCard: {
    backgroundColor: '#fff', margin: 28, borderRadius: 20,
    padding: 32, alignItems: 'center',
  },
  successCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8},
  successTxt: {fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24},
  successBtn: {
    backgroundColor: '#7B2533', borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  successBtnTxt: {color: '#fff', fontWeight: '700', fontSize: 16},
});
