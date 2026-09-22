import React, {useState, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';
import {useCart} from '../../context/CartContext';

const PRIMARY = '#7B2533';

const CartScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {cartItems, removeFromCart, updateQuantity, clearCart} = useCart();
  const [selectedItems, setSelectedItems] = useState(
    new Set(cartItems.map(item => item._id)),
  );

  // ── Remove-confirmation bottom sheet ──
  const [confirm, setConfirm] = useState({visible: false, mode: null, item: null});
  const sheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: confirm.visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [confirm.visible, sheetAnim]);

  const openRemoveSheet = item =>
    setConfirm({visible: true, mode: 'single', item});
  const openClearSheet = () =>
    setConfirm({visible: true, mode: 'all', item: null});
  const closeSheet = () => setConfirm(c => ({...c, visible: false}));

  const confirmRemove = () => {
    if (confirm.mode === 'single' && confirm.item) {
      removeFromCart(confirm.item._id);
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(confirm.item._id);
        return next;
      });
    } else if (confirm.mode === 'all') {
      clearCart();
      setSelectedItems(new Set());
    }
    closeSheet();
  };

  // ── Calculations ──
  const calculations = useMemo(() => {
    const selectedCartItems = cartItems.filter(item =>
      selectedItems.has(item._id),
    );
    const totalAmount = selectedCartItems.reduce((total, item) => {
      const price = parseInt((item.price + '').replace('₹', '')) || 0;
      return total + price * item.quantity;
    }, 0);
    const totalItems = selectedCartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const savings = selectedCartItems.reduce((total, item) => {
      if (item.originalPrice) {
        const original =
          parseInt((item.originalPrice + '').replace('₹', '')) || 0;
        const current = parseInt((item.price + '').replace('₹', '')) || 0;
        return total + (original - current) * item.quantity;
      }
      return total;
    }, 0);

    return {
      totalAmount,
      totalItems,
      savings,
      grandTotal: totalAmount,
      selectedCartItems,
    };
  }, [cartItems, selectedItems]);

  const handleQuantityChange = (productId, change) => {
    const item = cartItems.find(i => i._id === productId);
    if (item && change < 0 && item.quantity <= 1) {
      openRemoveSheet(item);
      return;
    }
    updateQuantity(productId, change);
  };

  const handleRemoveItem = productId => {
    const item = cartItems.find(i => i._id === productId);
    if (item) openRemoveSheet(item);
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) openClearSheet();
  };

  const handleItemSelection = productId => {
    const next = new Set(selectedItems);
    next.has(productId) ? next.delete(productId) : next.add(productId);
    setSelectedItems(next);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(cartItems.map(item => item._id)));
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      Alert.alert('No Items Selected', 'Please select items to proceed.');
      return;
    }
    navigation.navigate('Checkout', {
      items: calculations.selectedCartItems,
      total: calculations.totalAmount,
    });
  };

  const allSelected =
    cartItems.length > 0 && selectedItems.size === cartItems.length;

  /* ─────────────────  CART ITEM CARD  ───────────────── */
  const renderCartItem = item => {
    const isSelected = selectedItems.has(item._id);
    const itemPrice = parseInt((item.price + '').replace('₹', '')) || 0;
    const originalPrice = item.originalPrice
      ? parseInt((item.originalPrice + '').replace('₹', '')) || 0
      : null;
    const totalPrice = itemPrice * item.quantity;
    const discount = originalPrice
      ? Math.round(((originalPrice - itemPrice) / originalPrice) * 100)
      : 0;

    return (
      <View key={item._id} style={styles.card}>
        {/* checkbox */}
        <TouchableOpacity
          style={styles.cardCheckbox}
          onPress={() => handleItemSelection(item._id)}
          activeOpacity={0.7}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <View
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Icon name="check" size={12} color="#fff" />}
          </View>
        </TouchableOpacity>

        {/* image */}
        <View style={styles.cardImageWrap}>
          <Image
            source={{
              uri: `https://sangamwholesale.com/products/${item.image}`,
            }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={styles.cardDiscountBadge}>
              <Text style={styles.cardDiscountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* details */}
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardName} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item._id)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="x" size={18} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          <Text style={styles.cardUnit}>
            {item.quantity} {item.unit || 'unit'}
          </Text>

          {/* price + stepper */}
          <View style={styles.cardBottomRow}>
            <View style={styles.cardPriceCol}>
              <View style={styles.priceLine}>
                <Text style={styles.cardPrice}>₹{totalPrice}</Text>
                {originalPrice && (
                  <Text style={styles.cardOriginal}>
                    ₹{originalPrice * item.quantity}
                  </Text>
                )}
              </View>
              <Text style={styles.cardPerUnit}>₹{itemPrice} each</Text>
            </View>

            {/* inline stepper */}
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleQuantityChange(item._id, -1)}
                activeOpacity={0.7}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <Icon
                  name={item.quantity <= 1 ? 'trash-2' : 'minus'}
                  size={14}
                  color="#fff"
                />
              </TouchableOpacity>
              <Text style={styles.stepQty}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleQuantityChange(item._id, 1)}
                activeOpacity={0.7}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <Icon name="plus" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  /* ─────────────────  EMPTY STATE  ───────────────── */
  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="shopping-cart" size={56} color={PRIMARY} />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Looks like you haven't added anything yet. Let's fix that!
      </Text>
      <TouchableOpacity
        style={styles.startShoppingButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}>
        <Icon name="shopping-bag" size={18} color="#fff" />
        <Text style={styles.startShoppingText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  /* ─────────────────  HEADER  ───────────────── */
  const Header = ({showClear}) => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}>
        <Icon name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Text>
        )}
      </View>
      {showClear ? (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClearCart}
          activeOpacity={0.7}>
          <Icon name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}
    </View>
  );

  /* ─────────────────  EMPTY RETURN  ───────────────── */
  if (cartItems.length === 0) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[styles.container, {backgroundColor: '#F4F5F7'}]}>
        <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />
        <Header showClear={false} />
        <EmptyCart />
      </SafeAreaView>
    );
  }

  /* ─────────────────  MAIN RETURN  ───────────────── */
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, {backgroundColor: '#F4F5F7'}]}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />
      <Header showClear />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* select all row */}
        <TouchableOpacity
          style={styles.selectAllRow}
          onPress={handleSelectAll}
          activeOpacity={0.7}>
          <View style={[styles.checkbox, allSelected && styles.checkboxSelected]}>
            {allSelected && <Icon name="check" size={12} color="#fff" />}
          </View>
          <Text style={styles.selectAllText}>
            {allSelected ? 'Deselect all' : 'Select all'}
          </Text>
          {calculations.savings > 0 && (
            <Text style={styles.savingsPill}>
              Saving ₹{calculations.savings}
            </Text>
          )}
        </TouchableOpacity>

        {/* items */}
        {cartItems.map(renderCartItem)}

        {/* bill details */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              Item total ({calculations.totalItems})
            </Text>
            <Text style={styles.billValue}>₹{calculations.totalAmount}</Text>
          </View>
          {calculations.savings > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, {color: '#22c55e'}]}>
                Total savings
              </Text>
              <Text style={styles.billSaving}>-₹{calculations.savings}</Text>
            </View>
          )}
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>To Pay</Text>
            <Text style={styles.billTotalValue}>
              ₹{calculations.grandTotal}
            </Text>
          </View>
        </View>

        <View style={{height: 20}} />
      </ScrollView>

      {/* ── sticky checkout bar ── */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutTotal}>
            ₹{calculations.grandTotal}
          </Text>
          <Text style={styles.checkoutSub}>
            {calculations.totalItems} items · {selectedItems.size} selected
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            selectedItems.size === 0 && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={selectedItems.size === 0}
          activeOpacity={0.85}>
          <Text style={styles.checkoutButtonText}>
            {selectedItems.size > 0 ? 'Proceed to Checkout' : 'Select Items'}
          </Text>
          <Icon name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── remove / clear bottom sheet ── */}
      <Modal
        visible={confirm.visible}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
        statusBarTranslucent>
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={closeSheet}>
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [400, 0],
                    }),
                  },
                ],
              },
            ]}
            onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetIconCircle}>
              <Icon name="trash-2" size={26} color="#FF4757" />
            </View>
            <Text style={styles.sheetTitle}>
              {confirm.mode === 'all' ? 'Clear your cart?' : 'Remove item?'}
            </Text>

            {confirm.mode === 'single' && confirm.item ? (
              <View style={styles.sheetProduct}>
                <Image
                  source={{
                    uri: `https://sangamwholesale.com/products/${confirm.item.image}`,
                  }}
                  style={styles.sheetProductImg}
                />
                <View style={{flex: 1}}>
                  <Text style={styles.sheetProductName} numberOfLines={1}>
                    {confirm.item.name}
                  </Text>
                  <Text style={styles.sheetProductMeta}>
                    ₹{confirm.item.price} · Qty {confirm.item.quantity}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.sheetSubtitle}>
                This will remove all {cartItems.length} items from your cart.
              </Text>
            )}

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={closeSheet}
                activeOpacity={0.8}>
                <Text style={styles.sheetCancelText}>Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetRemoveBtn}
                onPress={confirmRemove}
                activeOpacity={0.85}>
                <Icon name="trash-2" size={16} color="#fff" />
                <Text style={styles.sheetRemoveText}>
                  {confirm.mode === 'all' ? 'Clear All' : 'Remove'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: PRIMARY,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {alignItems: 'center'},
  headerTitle: {fontSize: 18, fontWeight: '700', color: '#fff'},
  headerSubtitle: {fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1},

  scrollView: {flex: 1},
  scrollContent: {padding: 14, paddingBottom: 10},

  /* select all */
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  selectAllText: {fontSize: 14, fontWeight: '600', color: '#333'},
  savingsPill: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: '700',
    color: '#22c55e',
    backgroundColor: '#E8F9EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  /* checkbox */
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxSelected: {backgroundColor: PRIMARY, borderColor: PRIMARY},

  /* cart card */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardCheckbox: {marginRight: 6},
  cardImageWrap: {
    position: 'relative',
    marginRight: 12,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
  },
  cardDiscountBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#FF4757',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardDiscountText: {color: '#fff', fontSize: 9, fontWeight: '800'},
  cardBody: {flex: 1},
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
    lineHeight: 18,
  },
  cardUnit: {fontSize: 12, color: '#95A5A6', marginTop: 3, marginBottom: 8},
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPriceCol: {flex: 1},
  priceLine: {flexDirection: 'row', alignItems: 'baseline'},
  cardPrice: {fontSize: 17, fontWeight: '800', color: '#1a1a1a'},
  cardOriginal: {
    fontSize: 13,
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  cardPerUnit: {fontSize: 11, color: '#95A5A6', marginTop: 1},

  /* stepper */
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    minWidth: 26,
    textAlign: 'center',
  },

  /* bill card */
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billLabel: {fontSize: 13, color: '#5A6672'},
  billValue: {fontSize: 13, fontWeight: '600', color: '#1a1a1a'},
  billSaving: {fontSize: 13, fontWeight: '700', color: '#22c55e'},
  billDivider: {
    height: 1,
    backgroundColor: '#EEF0F2',
    marginVertical: 6,
  },
  billTotalLabel: {fontSize: 15, fontWeight: '800', color: '#1a1a1a'},
  billTotalValue: {fontSize: 18, fontWeight: '800', color: PRIMARY},

  /* checkout bar */
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkoutInfo: {marginRight: 12},
  checkoutTotal: {fontSize: 20, fontWeight: '800', color: '#1a1a1a'},
  checkoutSub: {fontSize: 11, color: '#95A5A6', marginTop: 1},
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 15,
    borderRadius: 14,
  },
  checkoutButtonDisabled: {backgroundColor: '#CBD2D9'},
  checkoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },

  /* empty */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0E4E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  startShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },
  startShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  /* bottom sheet */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  sheetIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  sheetProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    marginTop: 6,
    marginBottom: 24,
  },
  sheetProductImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  sheetProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  sheetProductMeta: {fontSize: 13, color: '#7F8C8D'},
  sheetActions: {flexDirection: 'row', width: '100%'},
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sheetCancelText: {fontSize: 15, fontWeight: '700', color: '#555'},
  sheetRemoveBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRemoveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },
});

export default CartScreen;
