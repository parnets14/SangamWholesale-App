import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ToastAndroid,
  Image,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import {useNavigation} from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import {useAuth} from '../../context/AuthContext';
import DeviceInfo from 'react-native-device-info';
import RBSheet from 'react-native-raw-bottom-sheet';

const EditUserDetailsScreen = () => {
  const navigation = useNavigation();
  const {token, user: authUser, login, logout} = useAuth();

  console.log('token', token);

  const bottomSheetRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [fetchingSessions, setFetchingSessions] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    getCurrentDeviceInfo();
  }, []);

  const getCurrentDeviceInfo = async () => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      setCurrentDeviceId(deviceId);
    } catch (error) {
      console.error('Error getting device info:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setFetchingData(true);
      const response = await fetch(ENDPOINTS.USER_PROFILE, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      const data = await response.json();
      console.log('Profile data received:', data); // Debug log

      if (data.success && data.user) {
        setUserName(data.user.fullName || '');
        setEmailId(data.user.email || '');
        setMobileNumber(data.user.phone || '');

        // Handle profile image with proper validation
        if (data.user.profileImage) {
          console.log('Profile image URL:', data.user.profileImage); // Debug log
          setProfileImage(data.user.profileImage);
        } else {
          console.log('No profile image found');
          setProfileImage(null);
        }
      } else {
        console.log('No existing user profile or error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      setFetchingSessions(true);
      // Replace this with your actual API call
      // const response = await userApi.getActiveSessions();
      // setDevices(response.data);

      // Mock response for demonstration
      const mockResponse = {
        success: true,
        data: [
          {
            id: currentDeviceId,
            name: await DeviceInfo.getDeviceName(),
            model: await DeviceInfo.getModel(),
            brand: await DeviceInfo.getBrand(),
            os: `${await DeviceInfo.getSystemName()} ${await DeviceInfo.getSystemVersion()}`,
            isCurrent: true,
            lastActive: new Date().toISOString(),
          },
        ],
      };

      setDevices(mockResponse.data);
      bottomSheetRef.current.open();
    } catch (error) {
      console.error('Error fetching sessions:', error);
      Alert.alert('Error', 'Failed to fetch active sessions');
    } finally {
      setFetchingSessions(false);
    }
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      'Logout All Devices',
      'Are you sure you want to logout from all devices? You will need to login again on this device.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOutAll(true);
              // Replace with actual API call
              // await userApi.logoutAllDevices();

              // Mock API delay
              await new Promise(resolve => setTimeout(resolve, 1500));

              // Logout from current device
              await logout();

              if (Platform.OS === 'android') {
                ToastAndroid.show(
                  'Logged out from all devices',
                  ToastAndroid.LONG,
                );
              } else {
                Alert.alert('Success', 'Logged out from all devices');
              }
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout from all devices');
            } finally {
              setLoggingOutAll(false);
            }
          },
        },
      ],
    );
  };

  // Updated image upload function
  const uploadImageToServer = async imageUri => {
    try {
      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await fetch(ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success && result.profileImage) {
        // result.profileImage should be the path or URL returned by backend
        return result.profileImage;
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    if (!userName.trim()) {
      showAlert('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      let finalProfileImage = profileImage;

      // If local file, upload and get server path
      if (profileImage && profileImage.startsWith('file://')) {
        try {
          finalProfileImage = await uploadImageToServer(profileImage);
          setProfileImage(finalProfileImage); // Update to server path
        } catch (uploadError) {
          showAlert(
            'Failed to upload profile image. Saving profile without image.',
          );
          finalProfileImage = null;
        }
      }

      const profileData = {
        fullName: userName.trim(),
        email: emailId.trim(),
        profileImage: finalProfileImage,
      };

      const response = await fetch(
        ENDPOINTS.USER_PROFILE,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        },
      );
      const result = await response.json();
      if (result.success) {
        // Backend returns flat user: { fullName, email, profileImage }
        // AuthContext stores nested: { userDetails: {...}, businessDetails: {...} }
        const updatedUser = {
          ...authUser,
          userDetails: {
            ...(authUser?.userDetails || {}),
            fullName: userName.trim(),
            email: emailId.trim(),
            profileImage: result.user?.profileImage ?? finalProfileImage ?? authUser?.userDetails?.profileImage,
            isCompleted: true,
          },
        };
        await login(token, updatedUser);
        showAlert('Profile updated successfully!', false);
        navigation.goBack();
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      showAlert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, isError = true) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert(isError ? 'Error' : 'Success', message);
    }
  };

  // Updated image picker function
  const handleAddPhoto = () => {
    const options = {
      title: 'Select Profile Picture',
      mediaType: 'photo',
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.8,
      includeBase64: false,
    };

    Alert.alert(
      'Select Profile Picture',
      'Choose from where you want to select a picture',
      [
        {
          text: 'Camera',
          onPress: () => {
            ImagePicker.launchCamera(options, handleImageResponse);
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            ImagePicker.launchImageLibrary(options, handleImageResponse);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const handleImageResponse = response => {
    if (response.didCancel) return;
    if (response.errorCode) {
      showAlert('Error selecting image: ' + response.errorMessage);
      return;
    }
    if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0];
      if (selectedImage.uri) {
        setProfileImage(selectedImage.uri); // Show local image immediately
      } else {
        showAlert('Invalid image selected');
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Add your delete account API call here
              const response = await fetch(ENDPOINTS.DELETE_ACCOUNT, {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
              const result = await response.json();

              if (result.success) {
                showAlert('Account deleted successfully', false);
                await logout();
              } else {
                throw new Error(result.message || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              showAlert(
                error.message || 'Failed to delete account. Please try again.',
              );
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const renderDeviceItem = device => (
    <View style={styles.deviceItem} key={device.id}>
      <View style={styles.deviceIconContainer}>
        <Icon
          name={device.os.includes('iOS') ? 'smartphone' : 'tablet'}
          size={24}
          color={device.isCurrent ? '#7B2533' : '#6B7280'}
        />
      </View>
      <View style={styles.deviceInfoContainer}>
        <Text
          style={[styles.deviceName, device.isCurrent && styles.currentDevice]}>
          {device.name} {device.isCurrent && '(This device)'}
        </Text>
        <Text style={styles.deviceDetails}>
          {device.brand} {device.model} • {device.os}
        </Text>
        <Text style={styles.deviceLastActive}>
          Last active: {new Date(device.lastActive).toLocaleString()}
        </Text>
        {device.location && (
          <View style={styles.deviceLocationRow}>
            <Icon name="map-pin" size={12} color="#6B7280" />
            <Text style={styles.deviceLocation}> {device.location}</Text>
          </View>
        )}
      </View>
      {!device.isCurrent && (
        <TouchableOpacity style={styles.logoutDeviceButton}>
          <Icon name="log-out" size={18} color="#7B2533" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Updated profile image rendering with better error handling
  const renderProfileImage = () => {
    if (profileImage) {
      let imageSource;
      if (profileImage.startsWith('file://')) {
        imageSource = {uri: profileImage};
      } else {
        imageSource = {
          uri: `https://sangamwholesale.com/profileImage/${profileImage}`,
        };
      }
      return (
        <Image
          source={imageSource}
          style={styles.profileImage}
          onError={error => setProfileImage(null)}
        />
      );
    } else {
      return (
        <View style={styles.defaultProfileContainer}>
          <Icon name="user" size={50} color="#6B7280" />
        </View>
      );
    }
  };

  // Loader: show while fetchingData
  if (fetchingData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}>
        <ActivityIndicator size="large" color="#7B2533" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={loading || fetchingData}>
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={fetchUserProfile}
            disabled={fetchingData}>
            <Icon name="refresh-cw" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {renderProfileImage()}
            </View>
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}>
              <Text style={styles.addPhotoButtonText}>
                {profileImage ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name Section */}
          <Text style={styles.sectionTitle}>Name</Text>
          <View style={styles.detailRow}>
            <Icon name="user" size={20} color="#6B7280" />
            <TextInput
              style={styles.detailTextInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              editable={!fetchingData}
            />
          </View>

          {/* Mobile Number Section */}
          <Text style={styles.sectionTitle}>Mobile Number</Text>
          <View style={styles.detailRow}>
            <Icon name="phone" size={20} color="#6B7280" />
            <Text style={styles.countryCodeText}>+91</Text>
            <TextInput
              style={[styles.detailTextInput, {flex: 1, color: '#6B7280'}]}
              value={mobileNumber}
              placeholder="Mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              onChangeText={setMobileNumber}
            />
          </View>

          {/* Email Account Section */}
          <Text style={styles.sectionTitle}>Email Account</Text>
          <View style={styles.detailRow}>
            <Icon name="mail" size={20} color="#6B7280" />
            <TextInput
              style={[styles.detailTextInput, {flex: 1}]}
              value={emailId}
              onChangeText={setEmailId}
              placeholder="Add Email Id..."
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              editable={!fetchingData}
            />
          </View>

          {/* Account Security Section */}
          <Text style={styles.sectionTitle}>Account Security</Text>
          <TouchableOpacity
            style={styles.securityButton}
            onPress={fetchActiveSessions}
            disabled={fetchingSessions}>
            <Text style={styles.securityButtonText}>
              {fetchingSessions ? 'Loading...' : 'VIEW ACTIVE DEVICES'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.securityHintText}>
            Manage devices where your account is currently active
          </Text>

          <TouchableOpacity
            style={styles.logoutAllButton}
            onPress={handleLogoutAllDevices}
            disabled={loggingOutAll}>
            <Text style={styles.logoutAllButtonText}>
              {loggingOutAll ? 'Processing...' : 'LOGOUT FROM ALL DEVICES'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}>
            <Text style={styles.deleteAccountButtonText}>
              DELETE MY ACCOUNT
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Active Devices Bottom Sheet */}
        <RBSheet
          ref={bottomSheetRef}
          closeOnDragDown={true}
          closeOnPressMask={true}
          height={500}
          customStyles={{
            wrapper: {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
            container: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: 20,
            },
            draggableIcon: {
              backgroundColor: '#6B7280',
            },
          }}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              Active Devices ({devices.length})
            </Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current.close()}>
              <Icon name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.devicesList}>
            {devices.length > 0 ? (
              devices.map(renderDeviceItem)
            ) : (
              <View style={styles.noDevicesContainer}>
                <Icon name="smartphone" size={48} color="#E5E7EB" />
                <Text style={styles.noDevicesText}>
                  No active devices found
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomSheetFooter}>
            <Text style={styles.bottomSheetHint}>
              You're currently logged in on {devices.length} device
              {devices.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={handleLogoutAllDevices}
              disabled={loggingOutAll}>
              <Text style={styles.bottomSheetButtonText}>
                {loggingOutAll ? 'Processing...' : 'Logout from all devices'}
              </Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'left',
    marginLeft: 0,
  },
  saveButton: {
    padding: 10,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#7B2533',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  defaultProfileContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  addPhotoButton: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },
  addPhotoButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 10,
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  detailTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 15,
    fontWeight: '500',
  },
  securityButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2533',
    marginBottom: 10,
  },
  securityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B2533',
  },
  securityHintText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 20,
  },
  logoutAllButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B2533',
    marginBottom: 20,
  },
  logoutAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B2533',
  },
  deleteAccountButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Bottom Sheet Styles
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  devicesList: {
    flex: 1,
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  deviceIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceInfoContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  currentDevice: {
    color: '#7B2533',
  },
  deviceDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  deviceLastActive: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deviceLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  deviceLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  logoutDeviceButton: {
    padding: 8,
  },
  noDevicesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDevicesText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  bottomSheetFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomSheetHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomSheetButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bottomSheetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditUserDetailsScreen;
