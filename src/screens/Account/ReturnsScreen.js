import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
const API_ORDERS = 'https://sangamwholesale.com/api/orders/';
const API_RETURNS = 'https://sangamwholesale.com/api/return-orders';

const ReturnsScreen = () => {
  const navigation = useNavigation();
  const {token} = useAuth();
  console.log('DeliveriesScreen - user:', token);
  const [returnOrders, setReturnOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // For creating a return
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  const bottomSheetRef = useRef();

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  const fetchReturnOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_RETURNS, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.returnOrders)) {
        setReturnOrders(data.returnOrders);
      } else if (data.success && Array.isArray(data.returns)) {
        setReturnOrders(data.returns);
      } else {
        setReturnOrders([]);
      }
    } catch (err) {
      setError('Failed to fetch return orders.');
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(API_ORDERS, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    }
    setLoadingOrders(false);
  };

  // Open bottom sheet to create return
  const handleCreateReturn = async () => {
    await fetchOrders();
    setSelectedOrder(null);
    setSelectedItems([]);
    setComment('');
    bottomSheetRef.current.open();
  };

  // When user selects an order, prefill items
  const handleSelectOrder = order => {
    setSelectedOrder(order);
    setSelectedItems(
      order.items.map(item => ({
        ...item,
        reason: '',
      })),
    );
  };

  // Update reason for an item
  const handleReasonChange = (idx, reason) => {
    const updated = [...selectedItems];
    updated[idx].reason = reason;
    setSelectedItems(updated);
  };

  // Submit return
  const handleSubmitReturn = async () => {
    if (!selectedOrder) return;
    if (selectedItems.some(item => !item.reason)) {
      Alert.alert('Please provide a reason for all items.');
      return;
    }
    setPosting(true);
    try {
      const res = await fetch(API_RETURNS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          items: selectedItems.map(
            ({productId, name, sku, image, quantity, reason}) => ({
              productId,
              name,
              sku,
              image,
              quantity,
              reason,
            }),
          ),
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowConfirm(true);
        bottomSheetRef.current.close();
        fetchReturnOrders();
      } else {
        Alert.alert('Failed to create return', data.message || 'Try again');
      }
    } catch (err) {
      Alert.alert('Failed to create return', 'Try again');
    }
    setPosting(false);
  };

  // Render a return order card
  const renderReturnCard = ({item}) => (
    <View style={styles.returnCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.returnId}>Return ID: {item._id}</Text>
        <View style={[styles.statusBadge, {backgroundColor: '#FDE68A'}]}>
          <Icon name="clock" size={16} color="#F59E0B" />
          <Text style={[styles.statusText, {color: '#F59E0B'}]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.orderRef}>Order: {item.order}</Text>
      <Text style={styles.returnDate}>
        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
      </Text>
      <View style={styles.itemsContainer}>
        {item.items.map((prod, idx) => (
          <View key={prod._id || idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{prod.name}</Text>
            <Text style={styles.itemReason}>Reason: {prod.reason}</Text>
            <Text style={styles.itemQty}>Qty: {prod.quantity}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.commentText}>Comment: {item.comment}</Text>
    </View>
  );

  // Render order for selection in bottom sheet
  const renderOrderOption = ({item}) => (
    <TouchableOpacity
      style={[
        styles.orderOption,
        selectedOrder &&
          selectedOrder._id === item._id &&
          styles.orderOptionSelected,
      ]}
      onPress={() => handleSelectOrder(item)}>
      <Text style={styles.orderOptionText}>{item.orderId}</Text>
      <Text style={styles.orderOptionSub}>{item.deliveryAddress}</Text>
    </TouchableOpacity>
  );

  // Render item in selected order in bottom sheet
  const renderSelectedItem = ({item, index}) => (
    <View style={styles.selectedItemRow}>
      <Image
        source={{uri: `https://sangamwholesale.com/products/${item.image}`}}
        style={styles.selectedItemImage}
      />
      <View style={{flex: 1}}>
        <Text style={styles.selectedItemName}>{item.name}</Text>
        <Text style={styles.selectedItemSku}>SKU: {item.sku}</Text>
        <Text style={styles.selectedItemQty}>Qty: {item.quantity}</Text>
        <TextInput
          style={styles.reasonInput}
          placeholder="Reason for return"
          value={item.reason}
          onChangeText={text => handleReasonChange(index, text)}
        />
      </View>
    </View>
  );

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Returns & Refunds</Text>
          <TouchableOpacity
            style={styles.createReturnButton}
            onPress={handleCreateReturn}>
            <Icon name="plus" size={20} color="#fff" />
            <Text style={styles.createReturnButtonText}>Create Return</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#7B2533" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={fetchReturnOrders}
              style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={returnOrders}
            renderItem={renderReturnCard}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.errorText}>No returns found.</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Bottom Sheet for Creating Return */}
        <RBSheet
          ref={bottomSheetRef}
          height={500}
          openDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 16,
            },
          }}>
          <Text style={styles.sheetTitle}>Create Return</Text>
          {loadingOrders ? (
            <ActivityIndicator size="large" color="#7B2533" />
          ) : (
            <>
              {!selectedOrder ? (
                <>
                  <Text style={styles.sheetSubtitle}>Select an order:</Text>
                  <FlatList
                    data={orders}
                    renderItem={renderOrderOption}
                    keyExtractor={item => item._id}
                    style={{maxHeight: 200}}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.sheetSubtitle}>
                    Select items & reason:
                  </Text>
                  <FlatList
                    data={selectedItems}
                    renderItem={renderSelectedItem}
                    keyExtractor={(_, idx) => idx.toString()}
                    style={{maxHeight: 180}}
                  />
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChangeText={setComment}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitReturn}
                    disabled={posting}>
                    <Text style={styles.submitButtonText}>
                      {posting ? 'Submitting...' : 'Submit Return'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setSelectedOrder(null);
                      setSelectedItems([]);
                    }}>
                    <Text style={styles.cancelButtonText}>Back to Orders</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </RBSheet>

        {/* Confirmation Modal */}
        {showConfirm && (
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmBox}>
              <Icon name="check-circle" size={48} color="#10B981" />
              <Text style={styles.confirmText}>Return request submitted!</Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowConfirm(false)}>
                <Text style={styles.confirmButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {padding: 5},
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  createReturnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createReturnButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
  listContainer: {padding: 20},
  returnCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  returnId: {fontSize: 15, fontWeight: '700', color: '#7B2533'},
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  statusText: {fontSize: 12, fontWeight: '600', marginLeft: 4},
  orderRef: {fontSize: 13, color: '#374151', marginBottom: 2},
  returnDate: {fontSize: 12, color: '#6B7280', marginBottom: 2},
  itemsContainer: {marginTop: 4, marginBottom: 4},
  itemRow: {marginBottom: 4},
  itemName: {fontSize: 13, color: '#374151', fontWeight: '500'},
  itemReason: {fontSize: 12, color: '#6B7280'},
  itemQty: {fontSize: 12, color: '#6B7280'},
  commentText: {fontSize: 13, color: '#374151', marginTop: 4},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  errorText: {color: '#7B2533', fontSize: 15, marginBottom: 10},
  retryButton: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {color: '#fff', fontWeight: '600'},
  // Bottom sheet styles
  sheetTitle: {fontSize: 18, fontWeight: '700', marginBottom: 8},
  sheetSubtitle: {fontSize: 15, fontWeight: '500', marginBottom: 8},
  orderOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  orderOptionSelected: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  orderOptionText: {fontSize: 15, fontWeight: '600', color: '#1F2937'},
  orderOptionSub: {fontSize: 13, color: '#6B7280'},
  selectedItemRow: {flexDirection: 'row', marginBottom: 10},
  selectedItemImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  selectedItemName: {fontSize: 14, fontWeight: '600', color: '#1F2937'},
  selectedItemSku: {fontSize: 12, color: '#6B7280'},
  selectedItemQty: {fontSize: 12, color: '#6B7280'},
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    marginTop: 4,
    backgroundColor: '#F9FAFB',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginTop: 10,
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  submitButtonText: {color: '#fff', fontWeight: '700', fontSize: 16},
  cancelButton: {
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
  },
  cancelButtonText: {color: '#7B2533', fontWeight: '600'},
  // Confirmation
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  confirmBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 220,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginVertical: 16,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  confirmButtonText: {color: '#fff', fontWeight: '700', fontSize: 16},
});

export default ReturnsScreen;
