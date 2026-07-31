import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ToastAndroid,
  StatusBar,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';
import {useWishlist} from '../../context/WishlistContext';
import {useCart} from '../../context/CartContext';
import {useAuth} from '../../context/AuthContext';

const ProductDetailsScreen = ({navigation, route}) => {
  const {product} = route.params;
  const {user, token} = useAuth();
  console.log('Product Details:', product);
  const {theme} = useTheme();
  const {isWishlisted, toggleWishlist} = useWishlist();
  const {addToCart} = useCart();
  const [quantity, setQuantity] = useState(1);

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    addToCart({...product, quantity});
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [
        {text: 'Continue Shopping', style: 'cancel'},
        {text: 'Add to Cart', onPress: () => navigation.navigate('FoodTab')},
      ],
    );
  };

  const handleWishlist = () => {
    toggleWishlist(product._id);
    Alert.alert(
      !wishlisted ? '❤️ Added to Wishlist' : '💔 Removed from Wishlist',
      `${product.name} has been ${
        !wishlisted ? 'added to' : 'removed from'
      } your wishlist.`,
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌾 Check out this premium rice: ${product.name}\n💰 Only ₹${product.price}/${product.unit}\n\nOrder now on Udaan!`,
        url: `https://udaan.com/product/${product._id}`,
        title: product.name,
      });
    } catch (error) {
      Alert.alert('Share', error.message);
    }
  };

  const hasDiscount = product.discountPrice && product.discountPrice > 0;
  const originalPrice = hasDiscount
    ? product.price + product.discountPrice
    : product.price;
  const discountPercent = hasDiscount
    ? Math.round((product.discountPrice / originalPrice) * 100)
    : 0;

  const totalPrice = product.price * quantity;
  const totalSavings = hasDiscount ? product.discountPrice * quantity : 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.backgroundColor}]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.statusBarBackground}
      />

      {/* Enhanced Header */}
      <View style={[styles.header, {backgroundColor: '#7B2533'}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Product Details
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.headerIcon}>
          <Icon name="shopping-cart" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{paddingBottom: 120}}>
        {/* Enhanced Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: `https://sangamwholesale.com/products/${product.image}`,
            }}
            style={styles.productImage}
          />

          {/* Stock Badge */}
          <View style={styles.stockBadge}>
            <Icon name="package" size={12} color="#fff" />
            <Text style={styles.stockText}>{product.stock} in stock</Text>
          </View>

          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadgeTop}>
              <Text style={styles.discountTextTop}>
                -{discountPercent}% OFF
              </Text>
            </View>
          )}

          {/* Floating Action Buttons */}
          <TouchableOpacity
            style={[
              styles.wishlistFloating,
              {
                backgroundColor: wishlisted
                  ? 'rgba(255,107,107,0.9)'
                  : 'rgba(0,0,0,0.6)',
              },
            ]}
            onPress={handleWishlist}
            activeOpacity={0.8}>
            <Icon
              name="heart"
              size={20}
              color="#fff"
              fill={wishlisted ? '#fff' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareFloating}
            onPress={handleShare}
            activeOpacity={0.8}>
            <Icon name="share-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Enhanced Product Info */}
        <View style={styles.productInfo}>
          {/* Brand and Rating Row */}
          <View style={styles.brandRow}>
            <View style={styles.brandContainer}>
              <Icon name="award" size={16} color="#7B2533" />
              <Text style={[styles.brandText, {color: theme.textColor}]}>
                {product.brand ||
                  product.subcategory?.name ||
                  'Premium Quality'}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD93D" />
              <Icon name="star" size={16} color="#FFD93D" />
              <Icon name="star" size={16} color="#FFD93D" />
              <Icon name="star" size={16} color="#FFD93D" />
              <Icon name="star" size={16} color="#E0E0E0" />
              <Text style={[styles.ratingText, {color: theme.textColor}]}>
                4.2 (89)
              </Text>
            </View>
          </View>

          {/* Product Name */}
          <Text style={[styles.productName, {color: theme.textColor}]}>
            {product.name}
          </Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{product.price}</Text>
              <Text style={styles.unitText}>
                {product.quantity} {product.unit}
              </Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              )}
            </View>
            {hasDiscount && (
              <Text style={styles.savingsText}>
                You save ₹{product.discountPrice} {product.quantity}{' '}
                {product.unit}
              </Text>
            )}
          </View>

          {/* Description */}
          <Text style={[styles.description, {color: theme.textColor}]}>
            {product.description}
          </Text>
        </View>

        {/* Enhanced Quantity Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shopping-bag" size={18} color="#7B2533" />
            <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
              Select Quantity
            </Text>
          </View>
          <View style={styles.quantityContainer}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Icon name="minus" size={18} color="#7B2533" />
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={[styles.quantityText, {color: theme.textColor}]}>
                  {quantity}
                </Text>
                <Text style={[styles.quantityUnit, {color: theme.textColor}]}>
                  {product.unit}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setQuantity(q => Math.min(product.stock, q + 1))
                }>
                <Icon name="plus" size={18} color="#7B2533" />
              </TouchableOpacity>
            </View>
            <View style={styles.quantityInfo}>
              <Text style={[styles.quantityPrice, {color: theme.textColor}]}>
                Total: ₹{totalPrice}
              </Text>
              {totalSavings > 0 && (
                <Text style={styles.quantitySavings}>
                  Save: ₹{totalSavings}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Product Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="check-circle" size={18} color="#7B2533" />
            <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
              Product Highlights
            </Text>
          </View>
          <View style={styles.highlightGrid}>
            <View style={styles.highlightItem}>
              <Icon name="shield-check" size={20} color="#4ECDC4" />
              <Text style={[styles.highlightText, {color: theme.textColor}]}>
                Premium Quality
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <Icon name="truck" size={20} color="#4ECDC4" />
              <Text style={[styles.highlightText, {color: theme.textColor}]}>
                Fast Delivery
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <Icon name="heart" size={20} color="#4ECDC4" />
              <Text style={[styles.highlightText, {color: theme.textColor}]}>
                Healthy Choice
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <Icon name="award" size={20} color="#4ECDC4" />
              <Text style={[styles.highlightText, {color: theme.textColor}]}>
                Best Taste
              </Text>
            </View>
          </View>
        </View>

        {/* Product Specifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info" size={18} color="#7B2533" />
            <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
              Product Information
            </Text>
          </View>
          <View style={styles.specGrid}>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, {color: theme.textColor}]}>
                Type
              </Text>
              <Text style={[styles.specValue, {color: theme.textColor}]}>
                {product.subcategory?.name || 'Premium Rice'}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, {color: theme.textColor}]}>
                Unit
              </Text>
              <Text style={[styles.specValue, {color: theme.textColor}]}>
                {product.quantity} {product.unit}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, {color: theme.textColor}]}>
                Stock
              </Text>
              <Text style={[styles.specValue, {color: theme.textColor}]}>
                {product.stock} available
              </Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, {color: theme.textColor}]}>
                Quality
              </Text>
              <Text style={[styles.specValue, {color: theme.textColor}]}>
                Grade A
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Bottom Action Bar */}
      <View
        style={[styles.bottomBar, {backgroundColor: theme.backgroundColor}]}>
        <View style={styles.bottomContent}>
          <View style={styles.priceSummary}>
            <Text style={[styles.summaryLabel, {color: theme.textColor}]}>
              Total Amount
            </Text>
            <View style={styles.summaryPriceRow}>
              <Text style={styles.summaryPrice}>₹{totalPrice}</Text>
              {totalSavings > 0 && (
                <Text style={styles.summarySavings}>Save ₹{totalSavings}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}>
            <Icon name="shopping-cart" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {marginRight: 16},
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerIcon: {marginLeft: 16},
  scrollView: {flex: 1},

  // Enhanced Image Container
  imageContainer: {
    position: 'relative',
    height: 320,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stockBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(46,139,87,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  stockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  discountBadgeTop: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
  },
  discountTextTop: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  wishlistFloating: {
    position: 'absolute',
    bottom: 20,
    right: 70,
    borderRadius: 25,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shareFloating: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Enhanced Product Info
  productInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#7B2533',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 28,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7B2533',
    marginRight: 8,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    color: '#999',
  },
  savingsText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },

  // Enhanced Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Enhanced Quantity Controls
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  quantityDisplay: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
  },
  quantityUnit: {
    fontSize: 12,
    opacity: 0.7,
  },
  quantityInfo: {
    alignItems: 'flex-end',
  },
  quantityPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  quantitySavings: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },

  // Highlight Grid
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  highlightItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Spec Grid
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    marginBottom: 16,
  },
  specLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Enhanced Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 4,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  priceSummary: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7B2533',
    marginRight: 8,
  },
  summarySavings: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#7B2533',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ProductDetailsScreen;
