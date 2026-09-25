import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  ToastAndroid,
  Image,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../../context/ThemeContext';
import {useCart} from '../../context/CartContext';
import {useAuth} from '../../context/AuthContext';
import {useFocusEffect} from '@react-navigation/native';
import useRazorpay from '../../hooks/useRazorpay';
import {ENDPOINTS} from '../../config/api';

// Coupon definitions. Validation is done client-side for now; the applied
// code + discount are also sent to the backend so it can re-verify later.
// type: 'percent' -> value is a percentage; 'flat' -> value is a rupee amount.
const AVAILABLE_COUPONS = [
  {code: 'SANGAM10', type: 'percent', value: 10, minOrder: 500, maxDiscount: 300},
  {code: 'FLAT100', type: 'flat', value: 100, minOrder: 1000},
  {code: 'WELCOME50', type: 'flat', value: 50, minOrder: 0},
];

const CheckoutScreen = ({navigation, route}) => {
  const {theme} = useTheme();
  const {clearCart} = useCart();
  const {user, token} = useAuth();
  const {items, total} = route.params;
  const {openRazorpay} = useRazorpay();
  const insets = useSafeAreaInsets();

  // State management
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [showCoupons, setShowCoupons] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // -- Price calculation (single source of truth) --------------------------
  const discount = (() => {
    if (!appliedCoupon) return 0;
    let d =
      appliedCoupon.type === 'percent'
        ? (total * appliedCoupon.value) / 100
        : appliedCoupon.value;
    if (appliedCoupon.maxDiscount) {
      d = Math.min(d, appliedCoupon.maxDiscount);
    }
    // Never discount more than the subtotal
    d = Math.min(d, total);
    return parseFloat(d.toFixed(2));
  })();

  const taxableAmount = Math.max(0, total - discount);
  const gstAmount = parseFloat((taxableAmount * 0.18).toFixed(2));
  const grandTotal = parseFloat((taxableAmount + gstAmount).toFixed(2));

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const found = AVAILABLE_COUPONS.find(c => c.code === code);
    if (!found) {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
      return;
    }

    if (total < found.minOrder) {
      setCouponError(
        `Minimum order of \u20B9${found.minOrder.toLocaleString()} required for this coupon`,
      );
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
    setCouponError('');
    setCouponCode(code);
    ToastAndroid.showWithGravity(
      `Coupon ${code} applied`,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Fetch addresses on focus (re-fetches when returning from address screen)
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchAddresses();
      } else {
        setLoading(false);
      }
    }, [token]),
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://sangamwholesale.com/api/addresses/',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const addressData = await response.json();
        console.log('Fetched addresses:', addressData);
        // addressData is {success: true, addresses: [...]}
        const addressesArr = addressData.addresses || [];
        setAddresses(addressesArr);
        // Set default address if available
        const defaultAddress =
          addressesArr.find(addr => addr.default) || addressesArr[0];
        setSelectedAddress(defaultAddress);
      } else {
        console.error('Failed to fetch addresses:', response.status);
        setAddresses([]);
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
      setSelectedAddress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.replace('Login');
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to place your order.', [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Login', onPress: handleLogin},
      ]);
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        'Address Required',
        'Please add a delivery address to continue.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Add Address',
            onPress: () => navigation.navigate('NewAddress'),
          },
        ],
      );
      return;
    }

    if (paymentMethod === 'razorpay') {
      // -- Online payment: open Razorpay, then place order after verification --
      setPlacingOrder(true);
      openRazorpay({
        amount: grandTotal,
        user,
        token,
        onSuccess: async paymentResult => {
          await submitOrder({
            paymentMethod: 'razorpay',
            paymentStatus: 'paid',
            razorpayPaymentId: paymentResult.razorpay_payment_id,
            razorpayOrderId: paymentResult.razorpay_order_id,
            razorpaySignature: paymentResult.razorpay_signature,
          });
          setPlacingOrder(false);
        },
        onFailure: _err => {
          setPlacingOrder(false);
        },
      });
    } else {
      // -- Cash on Delivery -------------------------------------------------
      setPlacingOrder(true);
      await submitOrder({paymentMethod: 'cod', paymentStatus: 'pending'});
      setPlacingOrder(false);
    }
  };

  const submitOrder = async extraPaymentFields => {
    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: formatAddress(selectedAddress),
        addressName: selectedAddress.shopName,
        addressContact: selectedAddress.deliveryContact || '6383626844',
        orderNotes,
        subtotal: total,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discount,
        gst: gstAmount,
        total: grandTotal,
        orderId: `UD${Math.floor(Math.random() * 1000000)}`,
        ...extraPaymentFields,
      };

      const response = await fetch(ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (response.ok) {
        clearCart();
        ToastAndroid.showWithGravity(
          'Order placed successfully',
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );
        navigation.replace('FoodTab', {
          orderId: data.order.orderId,
          amount: data.order.total,
        });
      } else {
        Alert.alert('Order Failed', data.message || 'Could not place order');
      }
    } catch (error) {
      Alert.alert('Order Error', error.message);
    }
  };

  const formatAddress = address => {
    if (!address) return '';
    return `${address.shopName}, ${address.shopNumber}, ${address.areaName}, ${address.town}, ${address.city} - ${address.pincode}`;
  };

  const formatShopTiming = address => {
    if (!address) return '';
    const lunchTime = address.lunchTime
      ? ` (Lunch: ${address.lunchTime.lunchStart}-${address.lunchTime.lunchEnd})`
      : '';
    return `Opens: ${address.shopOpenTime}${lunchTime}`;
  };

  const PaymentOption = ({
    method,
    icon,
    title,
    subtitle,
    isSelected,
    onPress,
  }) => (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        {
          backgroundColor: isSelected ? '#F0F7FF' : theme.cardBackground,
          borderColor: isSelected ? '#7B2533' : '#E5E7EB',
        },
      ]}
      onPress={onPress}>
      <View style={styles.paymentCardContent}>
        <View style={styles.paymentIconContainer}>
          <View
            style={[
              styles.paymentIcon,
              {backgroundColor: isSelected ? '#7B2533' : '#E5E7EB'},
            ]}>
            <Icon
              name={icon}
              size={18}
              color={isSelected ? '#fff' : '#6C757D'}
            />
          </View>
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>{title}</Text>
          <Text style={styles.paymentSubtitle}>{subtitle}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Icon name="check" size={16} color="#7B2533" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const OrderItem = ({item, index}) => (
    <View style={styles.orderItemCard}>
      <Image
        source={{
          uri: `https://sangamwholesale.com/products/${item.image}`,
        }}
        style={styles.productImage}
      />
      <View style={styles.orderItemInfo}>
        <Text style={styles.orderItemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <View style={styles.orderItemPricing}>
        <Text style={styles.orderItemPrice}>
          {'\u20B9'}{(item.price * item.quantity).toLocaleString()}
        </Text>
        <Text style={styles.orderItemUnitPrice}>
          {'\u20B9'}{item.price.toLocaleString()}/{item.quantity} {item.unit}
        </Text>
      </View>
    </View>
  );

  const renderDeliveryAddress = () => {
    if (!token) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MIcon name="place" size={18} color="#7B2533" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.loginPrompt}>
            <Icon name="user" size={24} color="#6B7280" />
            <Text style={styles.loginPromptText}>
              Please login to add delivery address
            </Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MIcon name="place" size={18} color="#7B2533" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#7B2533" />
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        </View>
      );
    }

    if (addresses.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MIcon name="place" size={18} color="#7B2533" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.noAddressContainer}>
            <MIcon name="place" size={24} color="#6B7280" />
            <Text style={styles.noAddressText}>No delivery address found</Text>
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('NewAddress')}>
              <Text style={styles.addAddressButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MIcon name="place" size={18} color="#7B2533" />
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditAddresses')}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.addressCard}>
          <Text style={styles.addressText}>
            {formatAddress(selectedAddress)}
          </Text>
          <View style={styles.addressMeta}>
            <Text style={styles.addressName}>{selectedAddress?.shopName}</Text>
            <Text style={styles.addressContact}>
              {selectedAddress?.deliveryContact}
            </Text>
          </View>
          {selectedAddress?.shopOpenTime && (
            <Text style={styles.shopTiming}>
              {formatShopTiming(selectedAddress)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderActionButton = () => {
    if (!token) {
      return (
        <TouchableOpacity
          style={styles.loginActionButton}
          onPress={handleLogin}>
          <Text style={styles.loginActionButtonText}>Login to Place Order</Text>
          <Icon name="log-in" size={18} color="#fff" />
        </TouchableOpacity>
      );
    }

    const isDisabled = !selectedAddress || addresses.length === 0 || placingOrder;
    const buttonLabel =
      placingOrder
        ? 'Processing-'
        : paymentMethod === 'razorpay'
        ? 'Pay Now'
        : 'Place Order';

    return (
      <TouchableOpacity
        style={[styles.checkoutButton, isDisabled && styles.disabledButton]}
        onPress={handlePlaceOrder}
        disabled={isDisabled}>
        {placingOrder ? (
          <ActivityIndicator size="small" color="#fff" style={{marginRight: 8}} />
        ) : (
          <Icon
            name={paymentMethod === 'razorpay' ? 'zap' : 'check-circle'}
            size={18}
            color="#fff"
            style={{marginRight: 8}}
          />
        )}
        <Text style={styles.checkoutButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, {backgroundColor: '#F5F7FA'}]}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Section */}
        {renderDeliveryAddress()}

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shopping-bag" size={18} color="#7B2533" />
            <Text style={styles.sectionTitle}>
              Order Summary ({items.length} items)
            </Text>
          </View>

          <View style={styles.orderItemsContainer}>
            {items.slice(0, 2).map(item => (
              <OrderItem key={item._id || item.productId} item={item} />
            ))}
            {items.length > 2 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  +{items.length - 2} more items
                </Text>
                <Icon name="chevron-down" size={16} color="#7B2533" />
              </TouchableOpacity>
            )}
          </View>

          {/* Coupon Section */}
          {/* <TouchableOpacity
            style={styles.couponSection}
            onPress={() => setShowCoupons(!showCoupons)}>
            <Icon name="tag" size={16} color="#7B2533" />
            <Text style={styles.couponText}>Apply Coupon</Text>
            <Icon
              name={showCoupons ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#6C757D"
            />
          </TouchableOpacity> */}

          {showCoupons && (
            <View>
              {appliedCoupon ? (
                <View style={styles.appliedCouponRow}>
                  <Icon name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.appliedCouponText}>
                    {appliedCoupon.code} applied
                  </Text>
                  <TouchableOpacity onPress={removeCoupon}>
                    <Text style={styles.removeCouponText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.couponDropdown}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor="#9CA3AF"
                    value={couponCode}
                    onChangeText={text => {
                      setCouponCode(text);
                      if (couponError) setCouponError('');
                    }}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={applyCoupon}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
              {couponError ? (
                <Text style={styles.couponError}>{couponError}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Payment Options - Only show if user is logged in */}
        {token && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="credit-card" size={18} color="#7B2533" />
              <Text style={styles.sectionTitle}>Payment Options</Text>
            </View>

            <PaymentOption
              method="razorpay"
              icon="zap"
              title="Pay Online"
              subtitle="UPI, Cards, Net Banking & Wallets"
              isSelected={paymentMethod === 'razorpay'}
              onPress={() => setPaymentMethod('razorpay')}
            />
            <PaymentOption
              method="cod"
              icon="dollar-sign"
              title="Cash on Delivery"
              subtitle="Pay when you receive"
              isSelected={paymentMethod === 'cod'}
              onPress={() => setPaymentMethod('cod')}
            />
          </View>
        )}

        {/* Order Notes - Only show if user is logged in */}
        {token && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="edit" size={18} color="#7B2533" />
              <Text style={styles.sectionTitle}>Order Notes</Text>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any special instructions for delivery..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              value={orderNotes}
              onChangeText={setOrderNotes}
            />
          </View>
        )}

        {/* Price Breakdown */}
        <View style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Subtotal ({items.length} items)
            </Text>
            <Text style={styles.priceValue}>{'\u20B9'}{total.toLocaleString()}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Discount ({appliedCoupon.code})
              </Text>
              <Text style={[styles.priceValue, {color: '#10B981'}]}>
                -{'\u20B9'}{discount.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Charges</Text>
            <Text style={[styles.priceValue, {color: '#10B981'}]}>FREE</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST</Text>
            <Text style={styles.priceValue}>
              {'\u20B9'}{gstAmount.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.divider, {marginVertical: 12}]} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>
              {'\u20B9'}{grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + 16}]}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerTotal}>
            {'\u20B9'}{grandTotal.toLocaleString()}
          </Text>
          <Text style={styles.footerText}>
            {paymentMethod === 'razorpay' ? 'Pay via Razorpay' : 'Cash on Delivery'}
          </Text>
        </View>
        {renderActionButton()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#7B2533',
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  changeText: {
    color: '#7B2533',
    fontSize: 14,
    fontWeight: '500',
  },

  // Login prompt styles
  loginPrompt: {
    alignItems: 'center',
    padding: 24,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 12,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Loading styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // No address styles
  noAddressContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noAddressText: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 12,
    textAlign: 'center',
  },
  addAddressButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Address card styles
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  addressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  addressContact: {
    fontSize: 14,
    color: '#6B7280',
  },
  shopTiming: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Order items styles
  orderItemsContainer: {
    marginBottom: 16,
  },
  orderItemCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  orderItemSku: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderItemPricing: {
    alignItems: 'flex-end',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderItemUnitPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  viewAllText: {
    color: '#7B2533',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },

  // Coupon styles
  couponSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginTop: 8,
  },
  couponText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  couponDropdown: {
    flexDirection: 'row',
    marginTop: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  appliedCouponText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  removeCouponText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
  couponError: {
    marginTop: 8,
    fontSize: 13,
    color: '#DC2626',
  },

  // Payment styles
  paymentCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentIconContainer: {
    marginRight: 12,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Notes input
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
  },

  // Price breakdown
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
  },
  footerPrice: {
    flex: 1,
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Button styles
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loginActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  loginActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default CheckoutScreen;
