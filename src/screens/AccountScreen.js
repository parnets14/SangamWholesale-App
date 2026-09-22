import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useAuth} from '../context/AuthContext';

const AccountScreen = ({navigation}) => {
  const {user} = useAuth();

  const fullName = user?.userDetails?.fullName || user?.name || '';
  const phone = user?.phone || '';

  // Build initials for the avatar (up to 2 chars)
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const handleCallSupport = () => {
    const phoneNumber = 'tel:+1234567890';
    Linking.openURL(phoneNumber);
  };

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Header with Red Background */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Account</Text>
            <Text style={styles.headerSubtitle}>
              Manage your business profile
            </Text>
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/Sangam-logo.jpeg')}
              style={styles.headerImage}
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Name Card � shown above Setup your account */}
            {(fullName || phone) && (
              <View style={styles.nameCard}>
                <View style={styles.avatarContainer}>
                  {initials ? (
                    <Text style={styles.avatarText}>{initials}</Text>
                  ) : (
                    <Icon name="user" size={24} color="#7B2533" />
                  )}
                </View>
                <View style={styles.nameTextContainer}>
                  {fullName ? (
                    <Text style={styles.nameText} numberOfLines={1}>
                      {fullName}
                    </Text>
                  ) : null}
                  {phone ? (
                    <Text style={styles.phoneText}>{phone}</Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Manage Your Business Section */}
            <Text style={styles.sectionTitle}>Manage Your Business</Text>

            {/* Business Menu Items */}
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Deliveries')}
                activeOpacity={0.7}>
                <View style={styles.menuIconContainer}>
                  <Icon name="truck" size={20} color="#374151" />
                </View>
                <Text style={styles.menuText}>Deliveries</Text>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('Returns')}
                activeOpacity={0.7}>
                <View style={styles.menuIconContainer}>
                  <Icon name="rotate-ccw" size={20} color="#374151" />
                </View>
                <Text style={styles.menuText}>Returns</Text>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.singleMenuItem}
              onPress={() => navigation.navigate('AccountSettings')}
              activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <Icon name="settings" size={20} color="#374151" />
              </View>
              <Text style={styles.menuText}>Account Settings</Text>
              <Icon name="chevron-right" size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Need any help Section */}
            <Text style={styles.sectionTitle}>Need any help?</Text>

            {/* Support Card */}
            <View style={styles.supportCard}>
              <View style={styles.supportHeader}>
                <View style={styles.supportIconContainer}>
                  <Icon name="user" size={20} color="#374151" />
                </View>
                <Text style={styles.supportTitle}>Support Hotline</Text>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={handleCallSupport}
                  activeOpacity={0.7}>
                  <Icon name="phone" size={16} color="#ffffff" />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.availabilityContainer}>
                <Text style={styles.availabilityText}>
                  Available 9 am to 6 pm � Monday to Saturday
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#7B2533',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7B2533',
    letterSpacing: 1,
  },
  nameTextContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  phoneText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  headerImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: 'cover',
  },
  mainContent: {
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  singleMenuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  supportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  callButton: {
    backgroundColor: '#7B2533',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
  availabilityContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 12,
  },
  availabilityText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AccountScreen;
