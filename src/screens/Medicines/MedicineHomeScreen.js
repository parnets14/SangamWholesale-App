import React from 'react';
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
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import {useTheme} from '../../context/ThemeContext';
import {useAuth} from '../../context/AuthContext';
const {width, height} = Dimensions.get('window');

const mainCategories = [
  {
    id: '1',
    name: 'OTC Medicines',
    subtitle: 'Over-the-Counter Drugs',
    image: require('../../assets/images/medicine-icon.png'),
    gradient: ['#4ECDC4', '#6EDDD6'],
  },
  {
    id: '2',
    name: 'Prescription',
    subtitle: 'Doctor Prescribed Medicines',
    image: require('../../assets/images/medicine-icon.png'),
    gradient: ['#FF6B6B', '#FF8E8E'],
  },
];

const shopByCategories = [
  {
    id: '1',
    name: 'Pain Relief',
    image: require('../../assets/images/medicine-icon.png'),
    itemCount: '85+ items',
  },
  {
    id: '2',
    name: 'Fever & Cold',
    image: require('../../assets/images/medicine-icon.png'),
    itemCount: '120+ items',
  },
  {
    id: '3',
    name: 'Digestive Health',
    image: require('../../assets/images/medicine-icon.png'),
    itemCount: '95+ items',
  },
  {
    id: '4',
    name: 'Vitamins & Supplements',
    image: require('../../assets/images/medicine-icon.png'),
    itemCount: '150+ items',
  },
  {
    id: '5',
    name: 'First Aid',
    image: require('../../assets/images/medicine-icon.png'),
    itemCount: '65+ items',
  },
  {
    id: '6',
    name: 'Medical Devices',
    image: require('../../assets/images/medicine-icon.png'),
    itemCount: '80+ items',
  },
];

const MedicineHomeScreen = ({navigation}) => {
  const {user} = useAuth();
  console.log('FoodHomeScreen - user:', user);

  const {theme} = useTheme();

  const renderShopByCategory = ({item}) => (
    <TouchableOpacity
      style={[
        styles.shopByCategoryCard,
        {backgroundColor: theme.backgroundColor},
      ]}
      onPress={() => navigation.navigate('PopularCategories', {category: item})}
      activeOpacity={0.8}>
      <View style={styles.categoryImageContainer}>
        <Image source={item.image} style={styles.shopByCategoryImage} />
        <View
          style={[
            styles.categoryOverlay,
            {backgroundColor: theme.backgroundColor},
          ]}>
          <Icon name="plus" size={16} color={theme.textColor} />
        </View>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={[styles.shopByCategoryName, {color: theme.textColor}]}>
          {item.name}
        </Text>
        <Text style={[styles.categoryItemCount, {color: theme.textColor}]}>
          {item.itemCount}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMainCategory = ({item}) => (
    <TouchableOpacity
      style={[
        styles.mainCategoryCard,
        {backgroundColor: theme.backgroundColor},
      ]}
      onPress={() => {
        if (item.id === '1') {
          navigation.navigate('Category', {category: item});
        } else if (item.id === '2') {
          navigation.navigate('Category', {category: item});
        }
      }}
      activeOpacity={0.9}>
      <View style={styles.mainCategoryContent}>
        <View style={styles.mainCategoryTextContainer}>
          <Text style={[styles.mainCategoryName, {color: theme.textColor}]}>
            {item.name}
          </Text>
          <Text style={[styles.mainCategorySubtitle, {color: theme.textColor}]}>
            {item.subtitle}
          </Text>
          <View style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore</Text>
            <Icon name="arrow-right" size={14} color="#fff" />
          </View>
        </View>
        <View style={styles.mainCategoryImageContainer}>
          <Image source={item.image} style={styles.mainCategoryImage} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderQuickAction = ({item}) => (
    <TouchableOpacity style={styles.quickActionCard}>
      <View style={[styles.quickActionIcon, {backgroundColor: item.color}]}>
        <Icon name={item.icon} size={20} color="#fff" />
      </View>
      <Text style={[styles.quickActionText, {color: theme.textColor}]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const quickActions = [
    {id: '1', name: 'Orders', icon: 'package', color: '#4ECDC4'},
    {id: '2', name: 'Prescriptions', icon: 'file-text', color: '#FF6B6B'},
    {id: '3', name: 'Health Tips', icon: 'heart', color: '#FFD93D'},
    {id: '4', name: 'Support', icon: 'help-circle', color: '#6C5CE7'},
  ];

  return (
    <>
      <StatusBar
        backgroundColor="#7B2533"
        barStyle="light-content"
      />
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
                    : user?.businessDetails?.category || 'Select'}
                </Text>
                <Icon name="chevron-down" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="bell" size={20} color="#fff" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="shopping-cart" size={20} color="#fff" />
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
                {backgroundColor: theme.backgroundColor},
              ]}>
              <Icon name="search" size={18} color={theme.textColor} />
              <TextInput
                style={[styles.searchInput, {color: theme.textColor}]}
                placeholder="Search for medicines, vitamins..."
                placeholderTextColor={theme.textColor}
                onFocus={() => navigation.navigate('Search')}
              />
              <TouchableOpacity style={styles.searchRightIcon}>
                <Icon name="camera" size={18} color={theme.textColor} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}>
            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <FlatList
                data={quickActions}
                renderItem={renderQuickAction}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickActionsList}
              />
            </View>

            {/* Main Categories */}
            <View style={styles.mainCategoriesContainer}>
              <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
                Medicine Categories
              </Text>
              <FlatList
                data={mainCategories}
                renderItem={renderMainCategory}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mainCategoryList}
              />
            </View>

            {/* Shop by Categories Grid */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
                Health Categories
              </Text>
              <FlatList
                data={shopByCategories}
                renderItem={renderShopByCategory}
                keyExtractor={item => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.shopByCategoryColumnWrapper}
              />
            </View>

            {/* Health Tips Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
                Health Tips
              </Text>
              <View
                style={[
                  styles.healthTipCard,
                  {backgroundColor: theme.backgroundColor},
                ]}>
                <View style={styles.healthTipContent}>
                  <View style={styles.healthTipIcon}>
                    <Icon name="heart" size={24} color="#FF6B6B" />
                  </View>
                  <View style={styles.healthTipText}>
                    <Text
                      style={[styles.healthTipTitle, {color: theme.textColor}]}>
                      Stay Healthy
                    </Text>
                    <Text
                      style={[
                        styles.healthTipDescription,
                        {color: theme.textColor},
                      ]}>
                      Get daily health tips and wellness advice from medical
                      experts
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.healthTipButton}>
                  <Text style={styles.healthTipButtonText}>Read More</Text>
                  <Icon name="arrow-right" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Special Offers */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, {color: theme.textColor}]}>
                Special Offers
              </Text>
              <View
                style={[
                  styles.offerCard,
                  {backgroundColor: theme.backgroundColor},
                ]}>
                <Image
                  source={require('../../assets/images/medicine-icon.png')}
                  style={styles.offerImage}
                />
                <View style={styles.offerContent}>
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeText}>20% OFF</Text>
                  </View>
                  <Text style={[styles.offerTitle, {color: theme.textColor}]}>
                    Health First Campaign
                  </Text>
                  <Text style={[styles.offerText, {color: theme.textColor}]}>
                    Get 20% discount on all vitamins and supplements!
                  </Text>
                  <TouchableOpacity
                    style={styles.offerButton}
                    onPress={() => navigation.navigate('SpecialOffers')}>
                    <Text style={styles.offerButtonText}>Shop Now</Text>
                    <Icon name="arrow-right" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={styles.sectionContainer}>
              <View
                style={[
                  styles.emergencyCard,
                  {backgroundColor: theme.backgroundColor},
                ]}>
                <View style={styles.emergencyContent}>
                  <View style={styles.emergencyIcon}>
                    <Icon name="phone" size={24} color="#FF6B6B" />
                  </View>
                  <View style={styles.emergencyText}>
                    <Text
                      style={[styles.emergencyTitle, {color: theme.textColor}]}>
                      Emergency Contact
                    </Text>
                    <Text
                      style={[
                        styles.emergencyNumber,
                        {color: theme.textColor},
                      ]}>
                      Call 108 for medical emergency
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.emergencyButton}>
                  <Icon name="phone" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
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
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickActionsList: {
    paddingVertical: 10,
  },
  quickActionCard: {
    alignItems: 'center',
    marginRight: 24,
    minWidth: 60,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  mainCategoriesContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  mainCategoryList: {
    paddingBottom: 10,
  },
  mainCategoryCard: {
    width: width * 0.75,
    marginRight: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  mainCategoryContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  mainCategoryTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  mainCategoryName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  mainCategorySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  mainCategoryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  mainCategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  shopByCategoryColumnWrapper: {
    justifyContent: 'space-between',
  },
  shopByCategoryCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  categoryImageContainer: {
    position: 'relative',
    height: 120,
  },
  shopByCategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    opacity: 0.9,
  },
  categoryInfo: {
    padding: 12,
  },
  shopByCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryItemCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  healthTipCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  healthTipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTipIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  healthTipText: {
    flex: 1,
  },
  healthTipTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  healthTipDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  healthTipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  healthTipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  offerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  offerImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  offerContent: {
    padding: 20,
    position: 'relative',
  },
  offerBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  offerText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  offerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emergencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 14,
    opacity: 0.7,
  },
  emergencyButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default MedicineHomeScreen;
