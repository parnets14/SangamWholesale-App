import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme} from '../../context/ThemeContext';
import axios from 'axios';

const CategoryScreen = ({navigation, route}) => {
  const {category} = route.params;
  const {theme} = useTheme();
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(
          'https://sangamwholesale.com/api/subcategories/',
        );
        // Filter subcategories by category._id
        const filtered = response.data.subcategories.filter(
          sub => sub.category._id === category._id,
        );
        setSubCategories(filtered);
      } catch (err) {
        setError('Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [category._id]);

  const renderSubCategory = ({item}) => (
    <TouchableOpacity
      style={[
        styles.subCategoryCard,
        {
          backgroundColor: theme.cardBackground || '#fff',
          borderColor: theme.primaryColor,
        },
      ]}
      onPress={() =>
        navigation.navigate('ProductList', {
          subcategory: item,
          subCategories: subCategories,
        })
      }
      activeOpacity={0.85}>
      <View style={styles.subCategoryImageContainer}>
        <Image
          source={{
            uri: `https://sangamwholesale.com/subcategories/${item.image}`,
          }}
          style={styles.subCategoryImage}
          defaultSource={require('../../assets/images/Sangam-logo.jpeg')}
        />
      </View>
      <View style={styles.subCategoryInfo}>
        <Text
          style={[styles.subCategoryName, {color: theme.statusBarBackground}]}
          numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.subCategoryItemCount,
            {color: theme.statusBarBackground},
          ]}
          numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <Icon
        name="chevron-right"
        size={22}
        color={theme.primaryColor}
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, {backgroundColor: theme.backgroundColor}]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={{color: theme.textColor, marginTop: 16}}>
          Loading subcategories...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.safeArea, {backgroundColor: theme.backgroundColor}]}>
        <Text style={{color: theme.textColor}}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            setError(null);
          }}>
          <Text style={{color: theme.primaryColor, marginTop: 8}}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {category?.name || 'Category'}
              </Text>
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
                placeholder="Search in this category..."
                placeholderTextColor={theme.textColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="x" size={18} color={theme.textColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Single FlatList — no ScrollView wrapper to avoid nesting warning */}
          <FlatList
            data={subCategories.filter(sub =>
              sub.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            renderItem={renderSubCategory}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.verticalList}
            ItemSeparatorComponent={() => <View style={{height: 16}} />}
            ListEmptyComponent={
              <View style={{alignItems: 'center', padding: 40}}>
                <Icon
                  name="shopping-bag"
                  size={40}
                  color={theme.textColor}
                  style={{opacity: 0.5, marginBottom: 16}}
                />
                <Text style={{color: theme.textColor, opacity: 0.7}}>
                  No subcategories available
                </Text>
              </View>
            }
          />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    padding: 4,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginTop: 20,
  },  subCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 8,
  },
  subCategoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  subCategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 30,
  },
  subCategoryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subCategoryItemCount: {
    fontSize: 13,
    opacity: 0.7,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  verticalList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
});

export default CategoryScreen;
