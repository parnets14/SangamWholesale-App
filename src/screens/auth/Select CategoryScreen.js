import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';

const SelectCategoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {businessName, businessType, frontPhoto, backPhoto} =
    route.params || {};
  console.log('businessName:', businessName);
  console.log('businessType:', businessType);
  console.log('frontPhoto:', frontPhoto);
  console.log('backPhoto:', backPhoto);
  const {token, user} = useAuth();
  console.log('token:', token);
  console.log('user:', user);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [existingBusinessData, setExistingBusinessData] = useState(null);

  const categories = [
    {
      id: 'food',
      title: 'Food',
      description: 'Staples, FMCG, Fruits & Vegetables, Meat, Eggs',
      icon: require('../../assets/images/food-icon.jpg'),
      backgroundColor: '#E8F5E8',
    },
    // {
    //   id: 'medicines',
    //   title: 'Medicines',
    //   description: 'OTC/FMCG, Generics, Ethicals, Medical Devices',
    //   icon: require('../../assets/images/medicine-icon.png'),
    //   backgroundColor: '#E8F8F8',
    // },
  ];

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const response = await fetch(
        ENDPOINTS.BUSINESS_GET,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        // handle business data
        console.log('Business:', result.business);
        setExistingBusinessData(result.business);
        if (result.business?.category) {
          setSelectedCategory(result.business.category);
        }
      } else {
        // handle error
        console.log('Error:', result.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const createBusinessProfile = async () => {
    try {
      const formData = new FormData();

      formData.append('businessName', businessName);
      formData.append('businessType', businessType);
      formData.append('category', selectedCategory);

      // 👇 Attach front and back images as file blobs
      if (frontPhoto) {
        formData.append('frontImage', {
          uri: frontPhoto,
          type: 'image/jpeg',
          name: 'front.jpg',
        });
      }

      if (backPhoto) {
        formData.append('backImage', {
          uri: backPhoto,
          type: 'image/jpeg',
          name: 'back.jpg',
        });
      }

      const response = await fetch(
        ENDPOINTS.BUSINESS_CREATE,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            //'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

      const data = await response.json();

      return {
        success: response.ok && data.success,
        data: data,
        error: data.message || 'Failed to create business profile',
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  };
  const updateBusinessProfile = async businessData => {
    try {
      const response = await fetch(
        ENDPOINTS.BUSINESS_UPDATE,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...businessData,
          }),
        },
      );
      const data = await response.json();

      return {
        success: response.ok && data.success,
        data: data,
        error: data.message || 'Failed to update business profile',
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  };

  const handleContinue = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const mergedData = {
        businessName: businessName || existingBusinessData?.businessName,
        businessType: businessType || existingBusinessData?.businessType,
        category: selectedCategory,
        frontImage: frontPhoto || existingBusinessData?.frontImage,
        backImage: backPhoto || existingBusinessData?.backImage,
      };

      const result = existingBusinessData
        ? await updateBusinessProfile(mergedData)
        : await createBusinessProfile(mergedData);

      if (result.success) {
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            `Business profile ${
              existingBusinessData ? 'updated' : 'created'
            } successfully!`,
            ToastAndroid.LONG,
          );
        } else {
          Alert.alert(
            'Success',
            `Business profile ${
              existingBusinessData ? 'updated' : 'created'
            } successfully!`,
          );
        }
        navigation.replace('Splash');
      } else {
        throw new Error(
          result.error ||
            `Failed to ${existingBusinessData ? 'update' : 'create'} profile`,
        );
      }
    } catch (error) {
      const message = error.message || 'Please try again.';
      Platform.OS === 'android'
        ? ToastAndroid.show(message, ToastAndroid.LONG)
        : Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Select Category</Text>
        <View style={styles.categoriesContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                {backgroundColor: category.backgroundColor},
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={1}>
              <View style={styles.categoryContent}>
                <View style={styles.iconContainer}>
                  <Image source={category.icon} style={styles.categoryIcon} />
                </View>
                <View style={styles.categoryTextContainer}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </View>
                <View style={styles.checkboxContainer}>
                  {selectedCategory === category.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!selectedCategory || loading || fetchingData) &&
              styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedCategory || loading || fetchingData}>
          <Text style={styles.buttonText}>
            {fetchingData
              ? 'Loading...'
              : loading
              ? existingBusinessData
                ? 'Updating Profile...'
                : 'Creating Profile...'
              : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    color: '#1A2A44',
    marginVertical: 20,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  categoryTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2A44',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  checkboxContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7B2533',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SelectCategoryScreen;
