import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';

const EditAddressesScreen = () => {
  const navigation = useNavigation();
  const {token} = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const API_BASE_URL = 'https://sangamwholesale.com/api/addresses';

  // Fetch addresses from API
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.addresses) {
        setAddresses(data.addresses);
        // Set the first default address as selected
        const defaultAddress = data.addresses.find(addr => addr.default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      } else {
        Alert.alert('Error', 'Failed to fetch addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh addresses
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  // Delete address
  const deleteAddress = async addressId => {
    try {
      const response = await fetch(`${API_BASE_URL}/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        Alert.alert('Success', 'Address deleted successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  // Update address (set as default)
  const updateAddress = async (addressId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh addresses after update
        await fetchAddresses();
        Alert.alert('Success', 'Address updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  // Load addresses when component mounts and when screen comes into focus
  useEffect(() => {
    fetchAddresses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, []),
  );

  const handleCallUs = () => {
    const phoneNumber = 'tel:+91638362684';
    Linking.openURL(phoneNumber);
  };

  const handleCreateNewAddress = () => {
    navigation.navigate('NewAddress');
  };

  const handleEditAddress = address => {
    navigation.navigate('NewAddress', {address});
  };

  const handleDeleteAddress = (addressId, shopName) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${shopName}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(addressId),
        },
      ],
    );
  };

  const handleSetDefault = addressId => {
    // First, set all addresses to non-default
    const updatePromises = addresses.map(addr => {
      if (addr._id === addressId) {
        return updateAddress(addressId, {...addr, default: true});
      }
      return null;
    });

    setSelectedAddress(addressId);
  };

  const formatTime = time => {
    if (!time) return 'Not set';
    return time;
  };

  const getDayStatus = (openClosedDays, day) => {
    if (!openClosedDays || !openClosedDays[day]) return 'Unknown';
    return openClosedDays[day] === 'open' ? 'Open' : 'Closed';
  };

  const renderAddressCard = ({item}) => (
    <View style={styles.addressCard}>
      {/* Header */}
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <View style={styles.typeIcon}>
            <Icon name="store" size={16} color="#7B2533" />
          </View>
          <View style={styles.addressTitleContainer}>
            <Text style={styles.addressTitle}>{item.shopName}</Text>
            <Text style={styles.businessName}>{item.areaName}</Text>
          </View>
        </View>
        <View style={styles.addressActions}>
          {item.default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(item)}>
            <Icon name="edit-2" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        <View style={styles.contactRow}>
          <Icon name="phone" size={14} color="#666" />
          <Text style={styles.contactText}>{item.deliveryContact}</Text>
        </View>
        <View style={styles.contactRow}>
          <Icon name="place" size={14} color="#666" />
          <Text style={styles.contactText}>{item.pincode}</Text>
        </View>
      </View>

      {/* Address Details */}
      <View style={styles.addressDetails}>
        <Text style={styles.addressText}>Shop No: {item.shopNumber}</Text>
        <Text style={styles.addressText}>
          {item.areaName}, {item.town}
        </Text>
        <Text style={styles.addressText}>
          {item.city} - {item.pincode}
        </Text>
      </View>

      {/* Business Hours */}
      <View style={styles.businessInfo}>
        <View style={styles.businessRow}>
          <Icon name="clock" size={14} color="#666" />
          <Text style={styles.businessText}>
            Open: {formatTime(item.shopOpenTime)}
          </Text>
        </View>
        {item.lunchTime && (
          <View style={styles.businessRow}>
            <Icon name="pause" size={14} color="#666" />
            <Text style={styles.businessText}>
              Lunch: {formatTime(item.lunchTime.lunchStart)} -{' '}
              {formatTime(item.lunchTime.lunchEnd)}
            </Text>
          </View>
        )}
      </View>

      {/* Weekly Schedule */}
      {item.openClosedDays && (
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Weekly Schedule:</Text>
          <View style={styles.scheduleGrid}>
            {Object.entries(item.openClosedDays).map(([day, status]) => (
              <View key={day} style={styles.dayStatus}>
                <Text style={styles.dayText}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    {color: status === 'open' ? '#10B981' : '#EF4444'},
                  ]}>
                  {status === 'open' ? 'Open' : 'Closed'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.verificationStatus}>
          <Icon name="check-circle" size={14} color="#10B981" />
          <Text style={styles.verificationText}>Active</Text>
        </View>
        <Text style={styles.lastUsedText}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        {!item.default && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(item._id)}>
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAddress(item._id, item.shopName)}>
          <Icon name="trash-2" size={16} color="#EF4444" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Addresses</Text>
          <TouchableOpacity style={styles.callUsButton} onPress={handleCallUs}>
            <Icon name="phone" size={16} color="#7B2533" />
            <Text style={styles.callUsButtonText}>Call Us</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B2533" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Addresses</Text>
          <TouchableOpacity style={styles.callUsButton} onPress={handleCallUs}>
            <Icon name="phone" size={16} color="#7B2533" />
            <Text style={styles.callUsButtonText}>Call Us</Text>
          </TouchableOpacity>
        </View>

        {/* Address Count */}
        <View style={styles.countContainer}>
          <Text style={styles.sectionTitle}>
            Shop Addresses ({addresses.length})
          </Text>
          <Text style={styles.sectionSubtitle}>
            Manage your shop delivery addresses and schedules
          </Text>
        </View>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Icon name="place" size={48} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Addresses Found</Text>
            <Text style={styles.emptyStateText}>
              Add your first shop address to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressCard}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#7B2533']}
                tintColor="#7B2533"
              />
            }
          />
        )}

        {/* Create New Address Button */}
        <TouchableOpacity
          style={styles.createAddressButton}
          onPress={handleCreateNewAddress}
          activeOpacity={0.7}>
          <Icon name="plus" size={20} color="#ffffff" />
          <Text style={styles.createAddressButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'left',
  },
  callUsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callUsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B2533',
    marginLeft: 5,
  },
  countContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#7B253320',
  },
  addressTitleContainer: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  businessName: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionButton: {
    padding: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  businessInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  scheduleContainer: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 80,
  },
  dayText: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  lastUsedText: {
    fontSize: 11,
    color: '#888',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setDefaultButton: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setDefaultText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '600',
  },
  createAddressButton: {
    backgroundColor: '#7B2533',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#7B2533',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  createAddressButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default EditAddressesScreen;
