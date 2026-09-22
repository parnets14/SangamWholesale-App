import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';
import {useWishlist} from '../../context/WishlistContext';
import {useCart} from '../../context/CartContext';
import {ENDPOINTS, IMAGE_BASE} from '../../config/api';

const PRIMARY = '#7B2533';

const WishlistScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {wishlist, removeFromWishlist} = useWishlist();
  const {addToCart, getItemCount} = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(ENDPOINTS.PRODUCTS);
        const data = await response.json();
        const filtered = (data.products || []).filter(prod =>
          wishlist.has(prod._id),
        );
        setProducts(filtered);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [wishlist]);

  const handleAddToCart = item => {
    addToCart({...item, quantity: 1});
  };

  const handleAddAllToCart = () => {
    products.forEach(item => addToCart({...item, quantity: 1}));
  };

  const renderProduct = ({item}) => (
    <View style={styles.card}>
      {/* Product Image */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetails', {product: item})}
        activeOpacity={0.9}>
        <Image
          source={{uri: `${IMAGE_BASE.PRODUCTS}${item.image}`}}
          style={styles.productImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Product Info */}
      <View style={styles.info}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', {product: item})}
          activeOpacity={0.9}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => handleAddToCart(item)}
          activeOpacity={0.85}>
          <Icon name="shopping-cart" size={14} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Heart / Remove Button */}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => removeFromWishlist(item._id)}>
        <Icon name="heart" size={20} color={PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  const cartCount = getItemCount();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>{products.length} items</Text>
        </View>
        {/* Cart icon with badge */}
        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={22} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Icon name="heart" size={56} color={`${PRIMARY}30`} />
          </View>
          <Text style={styles.emptyTitle}>No items in your wishlist</Text>
          <TouchableOpacity
            style={styles.startShoppingBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.startShoppingText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Action Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.addAllBtn}
              onPress={handleAddAllToCart}
              activeOpacity={0.85}>
              <Icon name="plus" size={16} color={PRIMARY} />
              <Text style={styles.addAllText}>Add All to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goToCartBtn}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.85}>
              <Icon name="shopping-cart" size={16} color="#fff" />
              <Text style={styles.goToCartText}>Go to Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#f5f5f5'},

  // Header
  header: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 4,
  },
  backButton: {padding: 4, marginRight: 8},
  headerCenter: {flex: 1},
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#fff'},
  headerSubtitle: {fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 1},
  cartIconBtn: {padding: 4, position: 'relative'},
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {fontSize: 10, fontWeight: '700', color: '#333'},

  // List
  list: {padding: 12, paddingBottom: 16},

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  productImage: {
    width: 85,
    height: 85,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    lineHeight: 20,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 10,
  },
  addToCartBtn: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  heartBtn: {
    padding: 8,
    alignSelf: 'flex-start',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  addAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 25,
    paddingVertical: 13,
  },
  addAllText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  goToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 25,
    paddingVertical: 13,
  },
  goToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Centered loader
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: `${PRIMARY}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  startShoppingBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 3,
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WishlistScreen;
