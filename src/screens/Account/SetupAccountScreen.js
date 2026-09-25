import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';

const SetupAccountScreen = ({}) => {
  const navigation = useNavigation();
  const {token, user} = useAuth();
  console.log('token:', token);
  console.log('user:', user);

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [kyc, setKyc] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(
          'https://sangamwholesale.com/api/business/get',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          console.log('Business data:', data.business);
          setBusiness(data.business);
        }
      } catch (error) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    const fetchKyc = async () => {
      try {
        const response = await fetch(
          'https://sangamwholesale.com/api/kyc/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setKyc(data.kyc);
        } else {
          setKyc(null);
        }
      } catch (error) {
        setKyc(null);
      }
    };
    fetchBusiness();
    fetchKyc();
  }, [token]);

  const handleCallUs = () => {
    Linking.openURL('tel:6383626844');
  };

  const handleWatchVideo = () => {
    Linking.openURL('https://www.youtube.com/watch?v=8v0TbDXR9AY');
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}>
        <ActivityIndicator size="small" color="#7B2533" />
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Header with Red Background */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
            }}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Setup your account</Text>
            <Text style={styles.headerSubtitle}>to start placing orders</Text>
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Sangam-logo.jpeg')}
              style={styles.headerImage}
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.mainContent}>
            {/* Owner Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.stepIndicatorCompleted}>
                  <Icon name="check" size={16} color="#ffffff" />
                </View>
                <Text style={styles.cardTitle}>Owner Details</Text>
                <View style={styles.cardIcon}>
                  <Icon name="user" size={20} color="#7B2533" />
                </View>
              </View>
            </View>

            {/* Business Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {business && business.approvalStatus === 'approved' ? (
                  <View style={styles.stepIndicatorCompleted}>
                    <Icon name="check" size={16} color="#ffffff" />
                  </View>
                ) : (
                  <View style={styles.stepIndicatorActive}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                )}
                <Text style={styles.cardTitle}>Business Details</Text>
                <View style={styles.cardIcon}>
                  <Icon name="home" size={20} color="#7B2533" />
                </View>
              </View>

              {/* Verification Status */}
              {business && business.approvalStatus === 'pending' && (
                <View style={styles.verificationStatus}>
                  <Icon name="settings" size={16} color="#7B2533" />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>
                      Please wait for confirmation
                    </Text>
                    <Text style={styles.verificationSubtitle}>
                      Your details are being reviewed. This usually takes 2 - 4
                      hours.
                    </Text>
                  </View>
                </View>
              )}
              {business && business.approvalStatus === 'rejected' && (
                <View style={styles.verificationStatus}>
                  <Icon name="x" size={16} color="#7B2533" />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>
                      Your business was rejected
                    </Text>
                    <Text style={styles.verificationSubtitle}>
                      {business.rejectionReason || 'Please contact support.'}
                    </Text>
                  </View>
                </View>
              )}
              {business && business.approvalStatus === 'approved' && (
                <View style={styles.verificationStatus}>
                  <Icon name="check" size={16} color="#10B981" />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>
                      Your business is approved!
                    </Text>
                    <Text style={styles.verificationSubtitle}>
                      You can now continue to the next step.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* KYC Status Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {kyc && kyc.approvalStatus === 'approved' ? (
                  <View style={styles.stepIndicatorCompleted}>
                    <Icon name="check" size={16} color="#ffffff" />
                  </View>
                ) : (
                  <View style={styles.stepIndicatorActive}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                )}
                <Text style={styles.cardTitle}>KYC Verification</Text>
                <View style={styles.cardIcon}>
                  <Icon name="file-text" size={20} color="#7B2533" />
                </View>
              </View>

              {/* Verification Status */}
              {kyc && kyc.approvalStatus === 'pending' && (
                <View style={styles.verificationStatus}>
                  <Icon name="settings" size={16} color="#7B2533" />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>
                      Please wait for KYC confirmation
                    </Text>
                    <Text style={styles.verificationSubtitle}>
                      Your KYC is being reviewed. This usually takes 2 - 4
                      hours.
                    </Text>
                  </View>
                </View>
              )}
              {kyc && kyc.approvalStatus === 'rejected' && (
                <View style={styles.verificationStatus}>
                  <Icon name="x" size={16} color="#7B2533" />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>
                      Your KYC was rejected
                    </Text>
                    <Text style={styles.verificationSubtitle}>
                      {kyc.rejectionReason || 'Please contact support.'}
                    </Text>
                  </View>
                </View>
              )}
              {kyc && kyc.approvalStatus === 'approved' && (
                <View style={styles.verificationStatus}>
                  <Icon name="check" size={16} color="#10B981" />
                  <View style={styles.verificationText}>
                    <Text style={styles.verificationTitle}>
                      Your KYC is approved!
                    </Text>
                    <Text style={styles.verificationSubtitle}>
                      You can now continue to the next step.
                    </Text>
                  </View>
                </View>
              )}
              {(!kyc || !kyc._id) && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => navigation.navigate('ShopKYC')}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
              {kyc && kyc.approvalStatus !== 'pending' && kyc._id && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => navigation.navigate('ShopKYC')}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Address Creation Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.stepIndicatorIncomplete}>
                  <Text style={styles.stepNumber}>4</Text>
                </View>
                <Text style={[styles.cardTitle, styles.inactiveText]}>
                  Address Creation
                </Text>
                <View style={styles.cardIcon}>
                  <Icon name="place" size={20} color="#9CA3AF" />
                </View>
              </View>
            </View>

            {/* Help Section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Need Any Help?</Text>

              <TouchableOpacity
                style={styles.helpCard}
                onPress={handleWatchVideo}>
                <View style={styles.helpIcon}>
                  <Icon name="play" size={16} color="#7B2533" />
                </View>
                <Text style={styles.helpText}>Watch Video Tutorials</Text>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.helpCard}
                onPress={handleCallUs}
                activeOpacity={1}>
                <View style={styles.helpIcon}>
                  <Icon name="phone" size={16} color="#7B2533" />
                </View>
                <Text style={styles.helpText}>Call Us</Text>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
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
    paddingBottom: 40,
  },
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
    padding: 20,
    paddingHorizontal: 10,
    marginTop: -12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7B2533',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorIncomplete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 16,
  },
  inactiveText: {
    color: '#9CA3AF',
  },
  cardIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
  },
  verificationText: {
    marginLeft: 12,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  verificationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#7B2533',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  helpSection: {
    marginTop: 24,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  helpCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  helpIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
});

export default SetupAccountScreen;
