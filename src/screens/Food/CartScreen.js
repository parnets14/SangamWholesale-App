import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';
import {useCart} from '../../context/CartContext';

const CartScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {cartItems, removeFromCart, updateQuantity, clearCart} = useCart();
  const [selectedItems, setSelectedItems] = useState(
    new Set(cartItems.map(item => item._id)),
  );

  // Memoized calculations for better performance
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

    return {totalAmount, totalItems, savings, selectedCartItems};
  }, [cartItems, selectedItems]);

  const handleQuantityChange = (productId, change) => {
    const item = cartItems.find(item => item._id === productId);
    if (item && change < 0 && item.quantity <= 1) return;
    updateQuantity(productId, change);
  };

  const handleRemoveItem = productId => {
    Alert.alert('Remove Item', 'Remove this item from your cart?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Clear All', style: 'destructive', onPress: clearCart},
    ]);
  };

  const handleItemSelection = productId => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item._id)));
    }
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

  const renderCartItem = (item, index) => {
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
      <View
        key={item._id}
        style={[styles.cartItem, {backgroundColor: theme.cardBackground}]}>
        {/* Selection and Remove */}
        <View style={styles.itemHeader}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => handleItemSelection(item._id)}
            activeOpacity={0.7}>
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Icon name="check" size={12} color="#fff" />}
            </View>
          </TouchableOpacity>

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item._id)}
            activeOpacity={0.7}>
            <Icon name="x" size={18} color="#FF4757" />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Image
            source={{
              uri: `https://sangamwholesale.com/products/${item.image}`,
            }}
            style={styles.productImage}
            resizeMode="cover"
          />

          <View style={styles.productDetails}>
            <Text
              style={[styles.productName, {color: theme.textColor}]}
              numberOfLines={2}>
              {item.name}
            </Text>

            <Text style={styles.productBrand}>
              {item.brand || 'Generic Brand'}
            </Text>

            <View style={styles.productMeta}>
              <Text style={styles.productUnit}>
                {item.quantity} {item.unit}
              </Text>
              <View style={styles.stockIndicator}>
                <View
                  style={[
                    styles.stockDot,
                    {backgroundColor: item.stock > 0 ? '#2ECC71' : '#E74C3C'},
                  ]}
                />
                <Text
                  style={[
                    styles.stockText,
                    {color: item.stock > 0 ? '#2ECC71' : '#E74C3C'},
                  ]}>
                  {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceSection}>
              <Text style={styles.currentPrice}>₹{itemPrice}</Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              )}
            </View>

            {/* Quantity Controls */}
            <View style={styles.quantitySection}>
              <Text style={[styles.quantityLabel, {color: theme.textColor}]}>
                Quantity:
              </Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    item.quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(item._id, -1)}
                  disabled={item.quantity <= 1}
                  activeOpacity={0.7}>
                  <Icon
                    name="minus"
                    size={14}
                    color={item.quantity <= 1 ? '#BDC3C7' : '#7B2533'}
                  />
                </TouchableOpacity>

                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item._id, 1)}
                  activeOpacity={0.7}>
                  <Icon name="plus" size={14} color="#7B2533" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Item Total */}
            <View style={styles.itemTotal}>
              <Text style={styles.itemTotalLabel}>Item Total:</Text>
              <Text style={styles.itemTotalPrice}>
                ₹{totalPrice.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name="shopping-cart"
          size={64}
          color={theme.textColor}
          opacity={0.3}
        />
      </View>
      <Text style={[styles.emptyTitle, {color: theme.textColor}]}>
        Your cart is empty
      </Text>
      <Text style={[styles.emptySubtitle, {color: theme.secondaryTextColor}]}>
        Discover amazing products and add them to your cart
      </Text>
      <TouchableOpacity
        style={styles.startShoppingButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}>
        <Icon name="shopping-bag" size={18} color="#fff" />
        <Text style={styles.startShoppingText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        {/* Header */}
        <></>
        <View
          style={[styles.header, {backgroundColor: theme.headerBackground}]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Icon name="arrow-left" size={24} color={theme.headerTextColor} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, {color: theme.headerTextColor}]}>
            Shopping Cart
          </Text>

          <View style={styles.headerButton} />
        </View>
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      <StatusBar
        backgroundColor="#7B2533"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.headerBackground}]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Icon name="arrow-left" size={24} color={theme.headerTextColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, {color: theme.headerTextColor}]}>
          Shopping Cart
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClearCart}
          activeOpacity={0.7}>
          <Icon name="trash-2" size={20} color={theme.headerTextColor} />
        </TouchableOpacity>
      </View>

      {/* Cart Summary */}
      <View
        style={[styles.cartSummary, {backgroundColor: theme.cardBackground}]}>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={handleSelectAll}
          activeOpacity={0.7}>
          <View
            style={[
              styles.checkbox,
              selectedItems.size === cartItems.length &&
                styles.checkboxSelected,
            ]}>
            {selectedItems.size === cartItems.length && (
              <Icon name="check" size={12} color="#fff" />
            )}
          </View>
          <Text style={[styles.selectAllText, {color: theme.textColor}]}>
            Select All
          </Text>
        </TouchableOpacity>

        <View style={styles.cartInfo}>
          <Text
            style={[styles.cartItemCount, {color: theme.secondaryTextColor}]}>
            {cartItems.length} items
          </Text>
          {calculations.savings > 0 && (
            <Text style={styles.savingsText}>
              You're saving ₹{calculations.savings.toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      {/* Cart Items */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {cartItems.map(renderCartItem)}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Checkout Footer */}
      <View
        style={[
          styles.checkoutFooter,
          {backgroundColor: theme.cardBackground},
        ]}>
        <View style={styles.checkoutSummary}>
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, {color: theme.secondaryTextColor}]}>
              Selected ({calculations.totalItems} items)
            </Text>
            <Text style={styles.summaryAmount}>
              ₹{calculations.totalAmount.toLocaleString()}
            </Text>
          </View>

          {calculations.savings > 0 && (
            <Text style={styles.savingsText}>
              Total Savings: ₹{calculations.savings.toLocaleString()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            selectedItems.size === 0 && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={selectedItems.size === 0}
          activeOpacity={0.8}>
          <Text style={styles.checkoutButtonText}>
            {selectedItems.size > 0 ? 'Checkout' : 'Select Items'}
          </Text>
          <Icon name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7B2533',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: '#7B2533',
    borderColor: '#7B2533',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cartInfo: {
    alignItems: 'flex-end',
  },
  cartItemCount: {
    fontSize: 12,
  },
  savingsText: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: '500',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  cartItem: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#ddd',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectButton: {
    padding: 4,
  },
  discountBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  productInfo: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productUnit: {
    fontSize: 12,
    color: '#95A5A6',
    marginRight: 12,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#95A5A6',
    textDecorationLine: 'line-through',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF3FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F8F9FA',
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemTotalLabel: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7B2533',
  },
  bottomSpacing: {
    height: 20,
  },
  checkoutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: '#ddd',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutSummary: {
    flex: 1,
    marginRight: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 160,
    justifyContent: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
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
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  startShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  startShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CartScreen;
