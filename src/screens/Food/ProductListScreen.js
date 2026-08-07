// App.js
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';
import {useWishlist} from '../../context/WishlistContext';

const {width: screenWidth} = Dimensions.get('window');

const ProductListScreen = ({navigation, route}) => {
  const {subcategory, subCategories} = route.params;
  const {theme} = useTheme();
  const [selectedSubCategory, setSelectedSubCategory] = useState(subcategory);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {toggleWishlist, isWishlisted} = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'https://sangamwholesale.com/api/products/',
        );
        const data = await response.json();
        const filtered = data.products.filter(
          prod =>
            prod.subcategory &&
            prod.subcategory._id === selectedSubCategory._id,
        );
        setProducts(filtered);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedSubCategory]);

  const renderSubCategory = ({item}) => (
    <TouchableOpacity
      style={[
        styles.subCategoryItem,
        {
          backgroundColor:
            item._id === selectedSubCategory._id
              ? theme.primaryColor + '20'
              : 'transparent',
          borderColor:
            item._id === selectedSubCategory._id
              ? theme.primaryColor
              : '#E5E5E5',
        },
      ]}
      onPress={() => setSelectedSubCategory(item)}
      activeOpacity={0.7}>
      <View style={styles.subCategoryImageContainer}>
        <Image
          source={{
            uri: `https://sangamwholesale.com/subcategories/${item.image}`,
          }}
          style={styles.subCategoryImage}
        />
      </View>
      <Text
        style={[
          styles.subCategoryName,
          {
            color:
              item._id === selectedSubCategory._id
                ? theme.primaryColor
                : theme.textColor,
          },
        ]}
        numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({item}) => {
    const wishlisted = isWishlisted(item._id);
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          {backgroundColor: theme.cardBackground || '#FFFFFF'},
        ]}
        onPress={() => navigation.navigate('ProductDetails', {product: item})}
        activeOpacity={0.9}>
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(item._id)}
          activeOpacity={0.7}>
          <Icon
            name={wishlisted ? 'heart' : 'heart'}
            size={20}
            color={wishlisted ? '#FF4757' : '#A4B0BE'}
            fill={wishlisted ? '#FF4757' : 'none'}
          />
        </TouchableOpacity>

        <View style={styles.productImageContainer}>
          <Image
            source={{
              uri: `https://sangamwholesale.com/products/${item.image}`,
            }}
            style={styles.productImage}
            defaultSource={require('../../assets/images/Sangam-logo.jpeg')}
          />
        </View>

        <View style={styles.productInfo}>
          <Text
            style={[styles.productName, {color: theme.textColor}]}
            numberOfLines={2}>
            {item.name}
          </Text>
          <Text
            style={[styles.productDesc, {color: theme.textColor}]}
            numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.productPrice, {color: theme.primaryColor}]}>
              ₹{item.price?.toLocaleString('en-IN') || item.price}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: theme.backgroundColor}]}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      {/* Header */}
      <View
        style={[
          styles.header,
          {backgroundColor: theme.primaryColor || '#7B2533'},
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {selectedSubCategory?.name || 'Products'}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Left Sidebar - Categories */}
        <View
          style={[
            styles.sidebar,
            {backgroundColor: theme.sidebarBackground || '#F8F9FA'},
          ]}>
          <FlatList
            data={subCategories}
            renderItem={renderSubCategory}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarContent}
          />
        </View>

        {/* Right Content - Products */}
        <View
          style={[styles.content, {backgroundColor: theme.backgroundColor}]}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={theme.primaryColor} />
              <Text style={[styles.loadingText, {color: theme.textColor}]}>
                Loading products...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Icon name="alert-circle" size={48} color="#FF4757" />
              <Text style={[styles.errorText, {color: theme.textColor}]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  {backgroundColor: theme.primaryColor},
                ]}
                onPress={() => setLoading(true)}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.centerContent}>
              <Icon name="package" size={48} color="#A4B0BE" />
              <Text style={[styles.emptyText, {color: theme.textColor}]}>
                No products found
              </Text>
              <Text style={[styles.emptySubText, {color: theme.textColor}]}>
                Try selecting a different category
              </Text>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
              ItemSeparatorComponent={() => (
                <View style={styles.productSeparator} />
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 90,
    paddingVertical: 8,
  },
  sidebarContent: {
    paddingVertical: 4,
  },
  content: {
    flex: 1,
  },

  // Subcategory Styles
  subCategoryItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 6,
    marginVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  subCategoryImageContainer: {
    marginBottom: 4,
  },
  subCategoryImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
  },
  subCategoryName: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },

  // Product Card Styles
  productsContainer: {
    padding: 12,
  },
  productCard: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productSeparator: {
    height: 8,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1,
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    paddingRight: 32, // Space for wishlist button
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  productDesc: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Center Content Styles
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubText: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default ProductListScreen;
