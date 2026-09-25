import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext'; // Adjust the import based on your context structure
const DeliveriesScreen = () => {
  // Navigation hook
  const {token} = useAuth();
  console.log('DeliveriesScreen - user:', token);
  const navigation = useNavigation();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch deliveries from API
  useEffect(() => {
    fetchDeliveries();
    // Live refresh every 15s so delivery status + OTP update on their own.
    const id = setInterval(() => fetchDeliveries({silent: true}), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDeliveries = async ({silent} = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await fetch(
        'https://sangamwholesale.com/api/orders/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      console.log('Fetched deliveries:', data);
      if (data.success && data.orders) {
        // Transform API data to match our UI structure
        const transformedDeliveries = data.orders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          supplierName: order.addressName || 'Unknown Supplier',
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit: 'pieces',
            image: item.image || null,
            productId: item.productId || item._id,
          })),
          totalValue: `\u20B9${order.total.toLocaleString()}`,
          // Prefer the delivery-partner lifecycle status when present.
          deliveryStatus: order.deliveryStatus,
          deliveryOtp: order.deliveryOtp,
          deliveryPartnerName: order.deliveryPartner?.name || null,
          status: getDeliveryStatus(order.deliveryStatus || order.status),
          expectedDelivery: getExpectedDeliveryDate(order.createdAt),
          trackingId: `TRK${order.orderId}`,
          currentLocation: getCurrentLocation(order.deliveryStatus || order.status),
          deliveryAddress: order.deliveryAddress,
          statusColor: getStatusColor(order.deliveryStatus || order.status),
          progress: getProgress(order.deliveryStatus || order.status),
          paymentMethod: order.paymentMethod,
          orderNotes: order.orderNotes,
          createdAt: order.createdAt,
          subtotal: order.subtotal,
          gst: order.gst,
          contactNumber: order.addressContact,
        }));

        setDeliveries(transformedDeliveries);
      } else if (!silent) {
        setError('Failed to load deliveries');
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      if (!silent) setError('Network error. Please check your connection.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Helper functions to transform API data
  const getDeliveryStatus = apiStatus => {
    switch (apiStatus?.toLowerCase()) {
      case 'placed':
      case 'pending':
        return 'Processing';
      case 'accepted':
      case 'confirmed':
        return 'In Transit';
      case 'out_for_delivery':
      case 'shipped':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'undelivered':
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Processing';
    }
  };

  const getStatusColor = apiStatus => {
    switch (apiStatus?.toLowerCase()) {
      case 'placed':
      case 'pending':
        return '#7B2533';
      case 'accepted':
      case 'confirmed':
        return '#F59E0B';
      case 'out_for_delivery':
      case 'shipped':
        return '#8B5CF6';
      case 'delivered':
        return '#10B981';
      case 'undelivered':
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getProgress = apiStatus => {
    switch (apiStatus?.toLowerCase()) {
      case 'placed':
      case 'pending':
        return 25;
      case 'accepted':
      case 'confirmed':
        return 55;
      case 'out_for_delivery':
      case 'shipped':
        return 85;
      case 'delivered':
        return 100;
      case 'undelivered':
      case 'cancelled':
        return 0;
      default:
        return 10;
    }
  };

  const getCurrentLocation = apiStatus => {
    switch (apiStatus?.toLowerCase()) {
      case 'placed':
      case 'pending':
        return 'Warehouse - Processing';
      case 'accepted':
      case 'confirmed':
        return 'Partner assigned';
      case 'out_for_delivery':
      case 'shipped':
        return 'Out for delivery';
      case 'delivered':
        return 'Delivered';
      case 'undelivered':
      case 'cancelled':
        return 'Delivery failed';
      default:
        return 'Processing';
    }
  };

  const getExpectedDeliveryDate = createdAt => {
    const orderDate = new Date(createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    return deliveryDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCallUs = () => {
    const phoneNumber = 'tel:+918045681234';
    Linking.openURL(phoneNumber);
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'Processing':
        return 'clock';
      case 'In Transit':
        return 'truck';
      case 'Out for Delivery':
        return 'navigation';
      case 'Delivered':
        return 'check-circle';
      case 'Cancelled':
        return 'x-circle';
      default:
        return 'package';
    }
  };

  const handleFilterPress = filter => {
    setActiveFilter(filter);
  };

  const getFilteredDeliveries = () => {
    if (activeFilter === 'All') {
      return deliveries;
    }
    return deliveries.filter(delivery => delivery.status === activeFilter);
  };

  const handleTrackOrder = (orderId, trackingId) => {
    Alert.alert(
      'Track Order',
      `Tracking ID: ${trackingId}\nOrder ID: ${orderId}`,
      [
        {text: 'OK', style: 'default'},
        {text: 'Call Support', onPress: handleCallUs},
      ],
    );
  };

  const handleRefresh = () => {
    fetchDeliveries();
  };

  const renderDeliveryCard = ({item}) => (
    <TouchableOpacity style={styles.deliveryCard}>
      {/* Header with Order ID and Status */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>{item.orderId}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.supplierName}>{item.supplierName}</Text>
          {item.deliveryPartnerName && (
            <Text style={styles.partnerName}>
              🛵 Partner: {item.deliveryPartnerName}
            </Text>
          )}
          {item.contactNumber && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${item.contactNumber}`)}>
              <Text style={styles.contactNumber}>{item.contactNumber}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: `${item.statusColor}20`},
          ]}>
          <Icon
            name={getStatusIcon(item.status)}
            size={16}
            color={item.statusColor}
          />
          <Text style={[styles.statusText, {color: item.statusColor}]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Items Summary */}
      <View style={styles.itemsContainer}>
        {item.items.slice(0, 2).map((product, index) => (
          <TouchableOpacity
            key={product.productId || product.name || index}
            onPress={() =>
              navigation.navigate('ProductDetails', {
                productId: product.productId,
              })
            }>
            <Text style={styles.itemText}>
              {'\u2022'} {product.name} - {product.quantity} {product.unit}
            </Text>
          </TouchableOpacity>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItemsText}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      {/* Product Images */}
      <View style={styles.productImagesRow}>
        {item.items
          .filter(product => product.image)
          .map((product, idx) => (
            <Image
              key={idx}
              source={{
                uri: `https://sangamwholesale.com/products/${product.image}`,
              }}
              style={styles.productImage}
            />
          ))}
      </View>

      {/* Delivery OTP - show to customer while out for delivery */}
      {item.deliveryStatus === 'out_for_delivery' && item.deliveryOtp ? (
        <View style={styles.otpCard}>
          <View style={styles.otpHeaderRow}>
            <Icon name="shield" size={16} color="#7B2533" />
            <Text style={styles.otpTitle}>Delivery OTP</Text>
          </View>
          <Text style={styles.otpValue}>{item.deliveryOtp}</Text>
          <Text style={styles.otpHint}>
            Share this OTP with the delivery partner to confirm your delivery.
          </Text>
        </View>
      ) : null}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {width: `${item.progress}%`, backgroundColor: item.statusColor},
            ]}
          />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>

      {/* Delivery Info */}
      <View style={styles.deliveryInfo}>
        <View style={styles.infoRow}>
          <Icon name="map-pin" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.deliveryAddress}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="navigation" size={16} color="#666" />
          <Text style={styles.infoText}>{item.currentLocation}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.infoText}>Expected: {item.expectedDelivery}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="dollar-sign" size={16} color="#666" />
          <Text style={styles.infoText}>Total: {item.totalValue}</Text>
        </View>
        {item.paymentMethod && (
          <View style={styles.infoRow}>
            <Icon name="credit-card" size={16} color="#666" />
            <Text style={styles.infoText}>Payment: {item.paymentMethod}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Icon name="file-text" size={16} color="#666" />
          <Text style={styles.infoText}>Subtotal: {'\u20B9'}{item.subtotal}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="percent" size={16} color="#666" />
          <Text style={styles.infoText}>GST: {'\u20B9'}{item.gst}</Text>
        </View>
      </View>

      {/* Order Notes */}
      {item.orderNotes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.orderNotes}</Text>
        </View>
      )}

      {/* Footer with Tracking */}
      <View style={styles.cardFooter}>
        <Text style={styles.trackingId}>Tracking: {item.trackingId}</Text>
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => handleTrackOrder(item.orderId, item.trackingId)}>
          <Text style={styles.trackButtonText}>Track Order</Text>
          <Icon name="external-link" size={14} color="#7B2533" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredDeliveries = getFilteredDeliveries();

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
          <Text style={styles.headerTitle}>Deliveries</Text>
          <TouchableOpacity style={styles.callUsButton} onPress={handleCallUs}>
            <Text style={styles.callUsButtonText}>Call Us</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              'All',
              'Processing',
              'In Transit',
              'Out for Delivery',
              'Delivered',
            ].map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.activeFilter,
                ]}
                onPress={() => handleFilterPress(filter)}>
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeFilterText,
                  ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7B2533" />
            <Text style={styles.loadingText}>Loading deliveries...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Error Loading Deliveries</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Deliveries List */}
        {!loading && !error && filteredDeliveries.length > 0 && (
          <FlatList
            data={filteredDeliveries}
            renderItem={renderDeliveryCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={handleRefresh}
          />
        )}

        {/* Empty State */}
        {!loading && !error && filteredDeliveries.length === 0 && (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.emptyStateIllustrationContainer}>
              <View style={styles.boxOne} />
              <View style={styles.boxTwo} />
              <View style={styles.boxThree} />
            </View>
            <Text style={styles.emptyStateTitle}>
              {activeFilter === 'All'
                ? 'No Deliveries Found'
                : `No ${activeFilter} Deliveries`}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeFilter === 'All'
                ? 'After placing your order, it will appear here as a delivery.'
                : `No deliveries with ${activeFilter} status found.`}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              You can track and see details of your delivery from here.
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}>
              <Icon name="refresh-cw" size={20} color="#7B2533" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
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
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  callUsButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  callUsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B2533',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
  },
  activeFilter: {
    backgroundColor: '#7B2533',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  deliveryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  supplierName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  partnerName: {
    fontSize: 13,
    color: '#7B2533',
    fontWeight: '600',
    marginTop: 2,
  },
  contactNumber: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  otpCard: {
    backgroundColor: '#7B25330D',
    borderWidth: 1,
    borderColor: '#7B253330',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  otpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7B2533',
    marginLeft: 6,
  },
  otpValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#7B2533',
    letterSpacing: 8,
    marginVertical: 6,
  },
  otpHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e5e5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    minWidth: 35,
  },
  deliveryInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  trackingId: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 14,
    color: '#7B2533',
    fontWeight: '600',
    marginRight: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateIllustrationContainer: {
    width: 200,
    height: 250,
    marginBottom: 30,
    position: 'relative',
  },
  boxOne: {
    position: 'absolute',
    width: 150,
    height: 180,
    backgroundColor: '#E0F2F7',
    borderRadius: 15,
    left: 0,
    top: 0,
    transform: [{rotate: '-10deg'}],
  },
  boxTwo: {
    position: 'absolute',
    width: 150,
    height: 200,
    backgroundColor: '#B3E0F2',
    borderRadius: 15,
    right: 0,
    top: 10,
    transform: [{rotate: '10deg'}],
  },
  boxThree: {
    position: 'absolute',
    width: 170,
    height: 220,
    backgroundColor: '#81D4FA',
    borderRadius: 15,
    zIndex: 1,
    top: 20,
    alignSelf: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7B2533',
  },
  refreshButtonText: {
    color: '#7B2533',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  productImagesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
});

export default DeliveriesScreen;
