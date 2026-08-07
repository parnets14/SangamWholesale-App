import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useAuth} from '../../context/AuthContext';
import {IMAGE_BASE} from '../../config/api';

const AccountSettingsScreen = ({navigation}) => {
  const {logout, user} = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            logout(); // Call your logout function
            if (Platform.OS === 'android') {
              ToastAndroid.show('Logout successfully', ToastAndroid.SHORT);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const MenuItem = ({iconName, title, subtitle, onPress, color, isLast}) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View
        style={[
          styles.menuIconContainer,
          {backgroundColor: color || '#E5E7EB'},
        ]}>
        <Icon name={iconName} size={20} color="#7B2533" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
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
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account</Text>
        </View>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileIconContainer}>
            {user?.userDetails?.profileImage ? (
              <Image
                source={{
                  uri: user.userDetails.profileImage.startsWith('http')
                    ? user.userDetails.profileImage
                    : `https://sangamwholesale.com/profileImage/${user.userDetails.profileImage}`,
                }}
                style={styles.profileImageImg}
                resizeMode="cover"
                onError={() => {}}
              />
            ) : (
              <Text style={styles.profileIconText}>
                {user?.userDetails?.fullName
                  ? user.userDetails.fullName.charAt(0).toUpperCase()
                  : '?'}
              </Text>
            )}
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>
              {user?.userDetails?.fullName || 'No name set'}
            </Text>
            <Text style={styles.profilePhone}>+91-{user?.phone}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditUserDetails')}
            style={styles.editProfileBtn}>
            <Icon name="edit-2" size={16} color="#7B2533" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Menu Items */}
          <View style={styles.menuSection}>
            <MenuItem
              iconName="user"
              title="User Details"
              subtitle="Name, Mobile, Email Account"
              onPress={() => navigation.navigate('EditUserDetails')}
            />
            <MenuItem
              iconName="briefcase"
              title="Business Details"
              subtitle="Name, Documents, Tax Certificate..."
              onPress={() => navigation.navigate('EditBusinessDetails')}
            />
            <MenuItem
              iconName="place"
              title="Manage Addresses"
              subtitle="Change or Edit Addresses"
              onPress={() => navigation.navigate('EditAddresses')}
            />
            <MenuItem
              iconName="book"
              title="Policies"
              subtitle="Know more about udaan and policies"
              onPress={() => navigation.navigate('Policies')}
              isLast={true}
            />
          </View>
        </ScrollView>
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -20, // Adjust to visually center title despite back button
  },
  scrollContainer: {
    paddingHorizontal: 0,
    paddingTop: 10, // Adjust based on visual spacing
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7B2533',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7B253340',
  },
  profileIconText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileImageImg: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  editProfileBtn: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#7B2533',
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffff',
  },
});

export default AccountSettingsScreen;
