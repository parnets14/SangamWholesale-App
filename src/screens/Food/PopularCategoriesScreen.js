import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';
import {useCart} from '../../context/CartContext';
import CartToast from '../../components/CartToast';

const {width, height} = Dimensions.get('window');

const PopularCategoriesScreen = ({navigation, route}) => {
  const {category} = route.params;
  const {theme, colorScheme} = useTheme();
  const {addToCart, getItemCount} = useCart();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityControls, setShowQuantityControls] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);

  const filters = ['All', 'Popular', 'New', 'Sale', 'Price: Low to High'];

  const products = [
    {
      id: '1',
      name: 'Premium Basmati Rice',
      brand: 'Organic Farms',
      price: '299',
      originalPrice: '399',
      image: require('../../assets/images/rice_poha.jpg'),
      rating: 4.5,
      reviews: 128,
      discount: '25% OFF',
      isNew: true,
      category: 'Grains',
    },
    {
      id: '2',
      name: 'Toor Dal 1kg',
      brand: 'Fresh Harvest',
      price: '89',
      originalPrice: '120',
      image: require('../../assets/images/dals_grains.jpeg'),
      rating: 4.3,
      reviews: 95,
      discount: '26% OFF',
      isSale: true,
      category: 'Pulses',
    },
    {
      id: '3',
      name: 'Pure Honey 500g',
      brand: 'Nature\'s Best',
      price: '199',
      originalPrice: '250',
      image: require('../../assets/images/dry_fruits.jpg'),
      rating: 4.7,
      reviews: 203,
      discount: '20% OFF',
      isPopular: true,
      category: 'Natural',
    },
    {
      id: '4',
      name: 'Whole Wheat Flour',
      brand: 'Healthy Grains',
      price: '45',
      originalPrice: '60',
      image: require('../../assets/images/aata_maida.jpg'),
      rating: 4.2,
      reviews: 67,
      discount: '25% OFF',
      category: 'Flour',
    },
    {
      id: '5',
      name: 'Mixed Spices Pack',
      brand: 'Spice Master',
      price: '75',
      originalPrice: '100',
      image: require('../../assets/images/masalas.jpg'),
      rating: 4.4,
      reviews: 89,
      discount: '25% OFF',
      isNew: true,
      category: 'Spices',
    },
    {
      id: '6',
      name: 'Rock Salt 1kg',
      brand: 'Pure Salt',
      price: '25',
      originalPrice: '35',
      image: require('../../assets/images/sugar_salt.jpg'),
      rating: 4.1,
      reviews: 45,
      discount: '29% OFF',
      isSale: true,
      category: 'Essentials',
    },
  ];

  const renderFilterButton = ({item}) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(item)}>
      <Text
        style={[
          styles.filterText,
          selectedFilter === item && styles.filterTextActive,
        ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQuantityControls(true);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;

    const cartItem = {
      ...selectedProduct,
      quantity: quantity,
      unit: 'unit',
      totalPrice: parseInt(selectedProduct.price.replace('₹', '')) * quantity,
    };
    
    addToCart(cartItem);
    setLastAddedProduct({...selectedProduct, quantity});
    setToastVisible(true);
    
    setShowQuantityControls(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleCancelAddToCart = () => {
    setShowQuantityControls(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlistItems);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      Alert.alert('Removed from Wishlist', `${products.find(p => p.id === productId)?.name} removed from wishlist`);
    } else {
      newWishlist.add(productId);
      Alert.alert('Added to Wishlist', `${products.find(p => p.id === productId)?.name} added to wishlist`);
    }
    setWishlistItems(newWishlist);
  };

  const renderProduct = ({item}) => {
    const isWishlisted = wishlistItems.has(item.id);
    
    return (
      <View style={styles.productCardContainer}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => navigation.navigate('ProductDetails', {product: item})}
          activeOpacity={0.9}>
          
          {/* Product Image */}
          <View style={styles.productImageContainer}>
            <Image source={item.image} style={styles.productImage} />
            
            {/* Badges */}
            <View style={styles.productBadges}>
              {item.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
              {item.isSale && (
                <View style={styles.saleBadge}>
                  <Text style={styles.saleBadgeText}>SALE</Text>
                </View>
              )}
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>HOT</Text>
                </View>
              )}
            </View>

            {/* Wishlist Button */}
            <TouchableOpacity 
              style={styles.wishlistButton}
              onPress={() => toggleWishlist(item.id)}>
              <View style={[styles.wishlistIcon, isWishlisted && styles.wishlistIconActive]}>
                <Icon 
                  name="heart" 
                  size={16} 
                  color={isWishlisted ? "#fff" : "#FF6B6B"} 
                />
              </View>
            </TouchableOpacity>

            {/* Category Tag */}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productBrand}>{item.brand}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            
            {/* Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.starContainer}>
                <Icon name="star" size={12} color="#FFD93D" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
            </View>

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>₹{item.price}</Text>
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              </View>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}>
              <Icon name="shopping-cart" size={16} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        backgroundColor="#7B2533"
        barStyle="light-content"
      />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {category?.name || 'Popular Categories'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {products.length} products available
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => navigation.navigate('Wishlist')}>
              <View style={styles.iconContainer}>
                <Icon name="heart" size={20} color="#fff" />
                {wishlistItems.size > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{wishlistItems.size}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={() => navigation.navigate('Cart')}>
              <View style={styles.iconContainer}>
                <Icon name="shopping-cart" size={20} color="#fff" />
                {getItemCount() > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{getItemCount()}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="x" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={filters}
            renderItem={renderFilterButton}
            keyExtractor={item => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        {/* Products Grid */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.productsContainer}>
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productsList}
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Quantity Controls Bottom Sheet */}
        {showQuantityControls && selectedProduct && (
          <View style={styles.quantityControlsOverlay}>
            <View style={styles.quantityControlsContainer}>
              <View style={styles.quantityHeader}>
                <Text style={styles.quantityTitle}>Select Quantity</Text>
                <TouchableOpacity onPress={handleCancelAddToCart}>
                  <Icon name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.productInfoRow}>
                <Image source={selectedProduct.image} style={styles.quantityProductImage} />
                <View style={styles.quantityProductInfo}>
                  <Text style={styles.quantityProductName}>
                    {selectedProduct.name}
                  </Text>
                  <Text style={styles.quantityProductBrand}>
                    {selectedProduct.brand}
                  </Text>
                  <Text style={styles.quantityProductPrice}>
                    ₹{selectedProduct.price}
                  </Text>
                </View>
              </View>

              <View style={styles.quantitySelector}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}>
                    <Icon name="minus" size={20} color={quantity <= 1 ? "#ccc" : "#fff"} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(1)}>
                    <Icon name="plus" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.quantityFooter}>
                <View style={styles.totalInfo}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalPrice}>
                    ₹{parseInt(selectedProduct.price.replace('₹', '')) * quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmAddToCart}>
                  <Icon name="shopping-cart" size={18} color="#fff" />
                  <Text style={styles.confirmButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      {/* Bottom Cart Bar */}
      {getItemCount() > 0 && (
        <TouchableOpacity
          style={styles.bottomCartBar}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.92}>
          <View style={styles.cartBarLeft}>
            <View style={styles.cartItemsBadge}>
              <Text style={styles.cartItemsCount}>{getItemCount()}</Text>
            </View>
            <Text style={styles.cartBarText}>items in cart</Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarAction}>View Cart</Text>
            <Icon name="chevron-right" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      {/* Zepto-style Cart Toast */}
      <CartToast
        visible={toastVisible}
        product={lastAddedProduct}
        cartCount={getItemCount()}
        onViewCart={() => navigation.navigate('Cart')}
        onDismiss={() => setToastVisible(false)}
      />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#7B2533',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 16,
  },
  iconContainer: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFD93D',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#333',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#7B2533',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
    color: '#333',
  },
  filtersContainer: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterButtonActive: {
    backgroundColor: '#7B2533',
    borderColor: '#7B2533',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productsList: {
    paddingBottom: 10,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productCardContainer: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    height: 160,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
  },
  newBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  saleBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  saleBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  popularBadge: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#333',
    fontSize: 9,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  wishlistIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wishlistIconActive: {
    backgroundColor: '#FF6B6B',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  productInfo: {
    padding: 16,
  },
  productBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: '#666',
  },
  priceSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7B2533',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    color: '#999',
  },
  discountText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B2533',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  bottomSpacing: {
    height: 20,
  },
  quantityControlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  quantityControlsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  quantityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  quantityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  productInfoRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  quantityProductImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
    marginRight: 15,
  },
  quantityProductInfo: {
    flex: 1,
  },
  quantityProductName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  quantityProductBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  quantityProductPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7B2533',
  },
  quantitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7B2533',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 25,
    minWidth: 35,
    textAlign: 'center',
  },
  quantityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7B2533',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Bottom cart bar
  bottomCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemsBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 10,
  },
  cartItemsCount: {
    color: '#7B2533',
    fontSize: 13,
    fontWeight: '800',
  },
  cartBarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBarAction: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 4,
  },
});

export default PopularCategoriesScreen; 
