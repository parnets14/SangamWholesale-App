import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useAuth} from '../../context/AuthContext';

const ManageBankAccountScreen = () => {
  const navigation = useNavigation();
  const {user, token} = useAuth();
  const addAccountRef = useRef();
  const editAccountRef = useRef();

  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    accountType: 'Current Account',
    ifscCode: '',
  });

  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://sangamwholesale.com/api/bank-accounts',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (response.ok) {
        setBankAccounts(data);
      } else {
        throw new Error(data.message || 'Failed to fetch bank accounts');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCallUs = () => {
    const phoneNumber = 'tel:+1800-123-4567';
    Linking.openURL(phoneNumber);
  };

  const handleCreateNewBankAccount = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      accountType: 'Current Account',
      ifscCode: '',
    });
    addAccountRef.current.open();
  };

  const handleSetDefault = async accountId => {
    try {
      const response = await fetch(
        `https://sangamwholesale.com/api/bank-accounts/${accountId}/default`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        fetchBankAccounts();
        Alert.alert('Success', 'Default account updated successfully!');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to set default account');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteAccount = async accountId => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://sangamwholesale.com/api/bank-accounts/${accountId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (response.ok) {
                fetchBankAccounts();
                Alert.alert('Success', 'Bank account deleted successfully!');
              } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete account');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
  };

  const handleEditAccount = account => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountHolderName: account.accountHolderName,
      accountType: account.accountType,
      ifscCode: account.ifscCode,
    });
    editAccountRef.current.open();
  };

  const handleSaveAccount = async () => {
    if (
      !formData.bankName ||
      !formData.accountNumber ||
      !formData.accountHolderName ||
      !formData.ifscCode
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      if (editingAccount) {
        // Update existing account
        const response = await fetch(
          `https://sangamwholesale.com/api/bank-accounts/${editingAccount.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          },
        );

        if (response.ok) {
          fetchBankAccounts();
          Alert.alert('Success', 'Bank account updated successfully!');
          editAccountRef.current.close();
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update account');
        }
      } else {
        // Add new account
        const response = await fetch(
          'https://sangamwholesale.com/api/bank-accounts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          },
        );

        if (response.ok) {
          fetchBankAccounts();
          Alert.alert('Success', 'Bank account added successfully!');
          addAccountRef.current.close();
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Failed to add account');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderBankAccountCard = account => (
    <View key={account.id} style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.bankInfo}>
          <View style={styles.bankLogo}>
            <Icon name="credit-card" size={24} color="#7B2533" />
          </View>
          <View style={styles.bankDetails}>
            <Text style={styles.bankName}>{account.bankName}</Text>
            <Text style={styles.accountType}>{account.accountType}</Text>
          </View>
        </View>
        {account.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.accountDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Number:</Text>
          <Text style={styles.detailValue}>{account.accountNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Holder:</Text>
          <Text style={styles.detailValue}>{account.accountHolderName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>IFSC Code:</Text>
          <Text style={styles.detailValue}>{account.ifscCode}</Text>
        </View>
      </View>

      <View style={styles.accountActions}>
        {!account.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(account.id)}>
            <Icon name="check-circle" size={16} color="#10B981" />
            <Text style={styles.actionButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditAccount(account)}>
          <Icon name="edit-2" size={16} color="#3B82F6" />
          <Text style={[styles.actionButtonText, styles.editButtonText]}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAccount(account.id)}>
          <Icon name="trash-2" size={16} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = (isEdit = false) => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {isEdit ? 'Edit Bank Account' : 'Add New Bank Account'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Bank Name"
        value={formData.bankName}
        onChangeText={text => setFormData(prev => ({...prev, bankName: text}))}
      />

      <TextInput
        style={styles.input}
        placeholder="Account Number"
        value={formData.accountNumber}
        onChangeText={text =>
          setFormData(prev => ({...prev, accountNumber: text}))
        }
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Account Holder Name"
        value={formData.accountHolderName}
        onChangeText={text =>
          setFormData(prev => ({...prev, accountHolderName: text}))
        }
      />

      <TextInput
        style={styles.input}
        placeholder="IFSC Code"
        value={formData.ifscCode}
        onChangeText={text =>
          setFormData(prev => ({...prev, ifscCode: text.toUpperCase()}))
        }
        autoCapitalize="characters"
      />

      <View style={styles.accountTypeContainer}>
        <Text style={styles.accountTypeLabel}>Account Type:</Text>
        <View style={styles.accountTypeButtons}>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              formData.accountType === 'Current Account' &&
                styles.accountTypeButtonActive,
            ]}
            onPress={() =>
              setFormData(prev => ({...prev, accountType: 'Current Account'}))
            }>
            <Text
              style={[
                styles.accountTypeButtonText,
                formData.accountType === 'Current Account' &&
                  styles.accountTypeButtonTextActive,
              ]}>
              Current
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              formData.accountType === 'Savings Account' &&
                styles.accountTypeButtonActive,
            ]}
            onPress={() =>
              setFormData(prev => ({...prev, accountType: 'Savings Account'}))
            }>
            <Text
              style={[
                styles.accountTypeButtonText,
                formData.accountType === 'Savings Account' &&
                  styles.accountTypeButtonTextActive,
              ]}>
              Savings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            if (isEdit) {
              editAccountRef.current.close();
            } else {
              addAccountRef.current.close();
            }
          }}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAccount}>
          <Text style={styles.saveButtonText}>
            {isEdit ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
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
            <Icon name="arrow-left" size={24} color="#ffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Bank Accounts</Text>
          <TouchableOpacity style={styles.callUsButton} onPress={handleCallUs}>
            <Icon name="phone" size={16} color="#3B82F6" />
            <Text style={styles.callUsButtonText}>Support</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Icon name="info" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Manage your bank accounts for seamless payments and settlements
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Your Bank Accounts</Text>

          {bankAccounts.length > 0 ? (
            bankAccounts.map(renderBankAccountCard)
          ) : (
            <View style={styles.emptyStateContainer}>
              <Icon name="credit-card" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No Bank Accounts</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add your first bank account to start receiving payments
              </Text>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={handleCreateNewBankAccount}
          activeOpacity={0.7}>
          <Icon
            name="plus"
            size={20}
            color="#ffffff"
            style={styles.buttonIcon}
          />
          <Text style={styles.createAccountButtonText}>
            Add New Bank Account
          </Text>
        </TouchableOpacity>

        {/* Add Account Bottom Sheet */}
        <RBSheet
          ref={addAccountRef}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={500}
          customStyles={{
            wrapper: styles.bottomSheetWrapper,
            draggableIcon: styles.bottomSheetIcon,
            container: styles.bottomSheetContainer,
          }}>
          {renderForm(false)}
        </RBSheet>

        {/* Edit Account Bottom Sheet */}
        <RBSheet
          ref={editAccountRef}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={500}
          customStyles={{
            wrapper: styles.bottomSheetWrapper,
            draggableIcon: styles.bottomSheetIcon,
            container: styles.bottomSheetContainer,
          }}>
          {renderForm(true)}
        </RBSheet>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'left',
  },
  callUsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callUsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 15,
    paddingHorizontal: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  accountType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  accountDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#EFF6FF',
  },
  editButtonText: {
    color: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  createAccountButton: {
    backgroundColor: '#7B2533',
    paddingVertical: 18,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: '#7B2533',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createAccountButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  // Bottom Sheet Styles
  bottomSheetWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSheetIcon: {
    backgroundColor: '#D1D5DB',
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  accountTypeContainer: {
    marginBottom: 20,
  },
  accountTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  accountTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  accountTypeButtonActive: {
    backgroundColor: '#7B2533',
    borderColor: '#7B2533',
  },
  accountTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  accountTypeButtonTextActive: {
    color: '#ffffff',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#7B2533',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default ManageBankAccountScreen;
