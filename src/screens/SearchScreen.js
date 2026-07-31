import {ENDPOINTS, IMAGE_BASE} from '../config/api';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const SearchScreen = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          'https://sangamwholesale.com/api/products/',
        );
        const data = await response.json();
        setProducts(data.products);
        setFiltered(data.products);
      } catch (err) {
        setProducts([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(
          p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description &&
              p.description.toLowerCase().includes(search.toLowerCase())),
        ),
      );
    }
  }, [search, products]);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'Check out this amazing product on Udaan!',
        url: 'https://udaan.com/product/example',
        title: 'Udaan Product',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const renderProduct = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', {product: item})}
      activeOpacity={0.85}>
      <Image
        source={{
          uri: `https://sangamwholesale.com/products/${item.image}`,
        }}
        style={styles.productImage}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.desc} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchBarContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            placeholderTextColor="#666"
            autoFocus={true}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Icon name="share-2" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7B2533"
            style={{marginTop: 40}}
          />
        ) : filtered.length === 0 ? (
          <Text style={styles.contentText}>No products found.</Text>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderProduct}
            keyExtractor={item => item._id}
            contentContainerStyle={{padding: 16}}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#7B2533',
    elevation: 2,
  },
  backButton: {
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginRight: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: '#f0f0f0',
  },
  info: {flex: 1},
  name: {fontSize: 15, fontWeight: '700', marginBottom: 2, color: '#222'},
  desc: {fontSize: 12, color: '#666', marginBottom: 2},
  price: {fontSize: 15, fontWeight: '700', color: '#7B2533'},
});

export default SearchScreen;
