import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useEffect, useState} from 'react';
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
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Feather';

import {useTheme} from '../../context/ThemeContext';
import axios from 'axios';
import {useWishlist} from '../../context/WishlistContext';
import {useCart} from '../../context/CartContext';
import {useAuth} from '../../context/AuthContext';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 3;
const BANNER_HEIGHT = 200;

const FoodHomeScreen = ({navigation}) => {
  const {user} = useAuth();
  console.log('FoodHomeScreen - user:', user);
  const {theme} = useTheme();
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const {wishlist} = useWishlist();
  const {getItemCount} = useCart();

  const fetchBanners = async () => {
    try {
      setBannerLoading(true);
      const response = await axios.get(
        'https://sangamwholesale.com/api/banners/',
      );
      console.log('Banners response:', response.data);
      // Backend stores images as array per banner — flatten all images into one list
      const allBanners = response.data.banners || [];
      const flatImages = [];
      allBanners.forEach(banner => {
        if (Array.isArray(banner.images)) {
          banner.images.forEach(img => flatImages.push({_id: img, image: img}));
        }
      });
      setBanners(flatImages);
    } catch (err) {
      console.error('Banners fetch error:', err);
    } finally {
      setBannerLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setError(null);
      const response = await axios.get(
        'https://sangamwholesale.com/api/categories/',
      );
      console.log('Categories response:', response.data); // Debug log

      // More robust data handling
      const categoriesData = response.data?.categories || response.data || [];
      setCategories(categoriesData.slice(0, 9));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch categories';
      setError(errorMessage);
      console.error('Categories fetch error:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setCategoriesLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchBanners()]);
    };
    loadData();
  }, []);

  const renderBannerSwiper = () => {
    if (bannerLoading) {
      return (
        <View style={[styles.bannerLoader, {height: BANNER_HEIGHT}]}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
        </View>
      );
    }
    if (!banners.length) return null;

    return (
      <View style={[styles.bannerContainer, {height: BANNER_HEIGHT}]}>
        <Swiper
          autoplay
          autoplayTimeout={2.5}
          showsPagination
          dotColor="rgba(255,255,255,0.5)"
          activeDotColor={theme.primaryColor || '#FF6B6B'}
          paginationStyle={styles.bannerPagination}
          containerStyle={styles.swiperContainer}>
          {banners.map(banner => (
            <TouchableOpacity key={banner._id} activeOpacity={0.9}>
              <Image
                source={{
                  uri: `https://sangamwholesale.com/${banner.image}`,
                }}
                style={styles.bannerImage}
                resizeMode="cover"
                defaultSource={require('../../assets/images/Sangam-logo.jpeg')}
                onError={e =>
                  console.warn('Banner image error:', e.nativeEvent.error)
                }
              />
            </TouchableOpacity>
          ))}
        </Swiper>
      </View>
    );
  };

  const renderShopByCategory = ({item}) => {
    // Add validation for item data
    if (!item || !item._id) {
      console.warn('Invalid category item:', item);
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.shopByCategoryCard,
          {backgroundColor: theme.cardBackground || theme.backgroundColor},
        ]}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.8}>
        <View style={styles.categoryImageContainer}>
          <Image
            source={{
              uri: `https://sangamwholesale.com/categories/${item.image}`,
            }}
            style={styles.shopByCategoryImage}
            resizeMode="cover"
            onError={e =>
              console.log('Category image error:', e.nativeEvent.error)
            }
          />
          <View style={styles.categoryOverlay}>
            <Icon
              name="shopping-bag"
              size={16}
              color={theme.primaryColor || '#FF6B6B'}
            />
          </View>
        </View>
        <View style={styles.categoryInfo}>
          <Text
            style={[
              styles.shopByCategoryName,
              {color: theme.textColor},
              theme.fonts?.medium,
            ]}
            numberOfLines={1}>
            {item.name || 'Unknown Category'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCategoryPress = item => {
    if (item && item._id) {
      navigation.navigate('Category', {category: item});
    }
  };

  // Show loading only when both categories and main loading are true
  if (loading && categoriesLoading) {
    return (
      <SafeAreaView
        style={[
          styles.loaderContainer,
          {backgroundColor: theme.backgroundColor},
        ]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={[styles.loadingText, {color: theme.textColor}]}>
          Loading ...
        </Text>
      </SafeAreaView>
    );
  }

  if (error && categories.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.errorContainer,
          {backgroundColor: theme.backgroundColor},
        ]}>
        <Icon name="alert-circle" size={40} color="#FF6B6B" />
        <Text style={[styles.errorText, {color: theme.textColor}]}>
          Failed to load categories
        </Text>
        <Text style={[styles.errorSubText, {color: theme.secondaryTextColor}]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, {backgroundColor: theme.primaryColor}]}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchCategories();
            fetchBanners();
          }}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView
        style={[styles.safeArea, {backgroundColor: theme.backgroundColor}]}>
        <View
          style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {backgroundColor: theme.statusBarBackground},
            ]}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../../assets/images/Sangam-logo.jpeg')}
                style={styles.headerImage}
              />
              <TouchableOpacity
                style={styles.categoryDropdown}
                onPress={() => navigation.replace('SelectCategory')}>
                <Text style={styles.categoryText}>
                  {user?.businessDetails?.category === 'food'
                    ? 'Food'
                    : user?.businessDetails?.category === 'medicines'
                    ? 'Medicines'
                    : user?.businessDetails?.category}
                </Text>
                <Icon name="chevron-down" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Wishlist')}>
                <Icon name="heart" size={20} color="#fff" />
                {wishlist.size > 0 && (
                  <View style={styles.wishlistBadge}>
                    <Text style={styles.badgeText}>{wishlist.size}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Cart')}>
                <Icon name="shopping-cart" size={20} color="#fff" />
                {getItemCount() > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.badgeText}>{getItemCount()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {backgroundColor: theme.statusBarBackground},
            ]}>
            <View
              style={[
                styles.searchBar,
                {backgroundColor: theme.searchBackground},
              ]}>
              <Icon
                name="search"
                size={18}
                color={theme.iconColor || '#ffff'}
              />
              <TextInput
                style={[styles.searchInput, {color: theme.textColor}]}
                placeholder="Search for dal, rice, oil..."
                placeholderTextColor={theme.placeholderColor || '#ffff'}
                onFocus={() => navigation.navigate('Search')}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}>
            {/* Banner Swiper */}
            {renderBannerSwiper()}

            {/* Shop by Categories */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
                  Shop by Categories
                </Text>
              </View>

              {categoriesLoading ? (
                <View style={styles.categoriesLoader}>
                  <ActivityIndicator size="large" color={theme.primaryColor} />
                  <Text style={[styles.loadingText, {color: theme.textColor}]}>
                    Loading categories...
                  </Text>
                </View>
              ) : categories.length === 0 ? (
                <View style={styles.noCategoriesContainer}>
                  <Icon
                    name="grid"
                    size={40}
                    color={theme.secondaryTextColor}
                  />
                  <Text
                    style={[styles.noCategoriesText, {color: theme.textColor}]}>
                    No categories available
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.retryButton,
                      {backgroundColor: theme.primaryColor},
                    ]}
                    onPress={fetchCategories}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={categories}
                  renderItem={renderShopByCategory}
                  keyExtractor={(item, index) => item._id || index.toString()}
                  numColumns={3}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.shopByCategoryColumnWrapper}
                  contentContainerStyle={styles.categoryGrid}
                  key={`categories-${categories.length}`} // Force re-render when data changes
                />
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  categoriesLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noCategoriesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noCategoriesText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 6,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD93D',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    elevation: 3,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
    includeFontPadding: false,
  },
  searchRightIcon: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    height: BANNER_HEIGHT,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  swiperContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  bannerPagination: {
    bottom: 10,
  },
  bannerLoader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sectionContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  shopByCategoryCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  categoryImageContainer: {
    position: 'relative',
    height: CARD_WIDTH - 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  shopByCategoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  categoryOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  categoryInfo: {
    padding: 10,
  },
  shopByCategoryName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryItemCount: {
    fontSize: 11,
    lineHeight: 14,
  },
  shopByCategoryColumnWrapper: {
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  categoryGrid: {
    paddingHorizontal: 5,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
    padding: 10,
    minWidth: (width - 60) / 2,
    maxWidth: (width - 60) / 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  productColumnWrapper: {
    justifyContent: 'space-between',
  },
  productGrid: {
    paddingHorizontal: 5,
  },
  wishlistBadge: {
    position: 'absolute',
    top: -2,
    right: 18,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FoodHomeScreen;
