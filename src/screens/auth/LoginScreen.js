import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const LoginScreen = ({navigation}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      ToastAndroid.show(
        'Please enter a valid 10-digit phone number',
        ToastAndroid.SHORT,
      );
      return;
    }

    if (!agreeToTerms) {
      ToastAndroid.show(
        'Please agree to Terms of Use & Privacy Policy',
        ToastAndroid.SHORT,
      );
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://sangamwholesale.com/api/user/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({phone: phoneNumber}),
        },
      );

      const data = await response.json();
      console.log('OTP Response:', data);

      if (response.ok && data.success) {
        // Show OTP in Toast for dev
        ToastAndroid.showWithGravity(
          `OTP: ${data.otp}`,
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );

        // Pass OTP and isNewUser to next screen if needed
        navigation.navigate('VerifyOTP', {
          phoneNumber,
          otp: data.otp,
        });
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
        ToastAndroid.show(
          data.message || 'Failed to send OTP. Please try again.',
          ToastAndroid.SHORT,
        );
      }
    } catch (err) {
      setError('Network error. Please try again.');
      ToastAndroid.show('Network error. Please try again.', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const openTermsOfUse = () => {
    // Navigate to Terms screen instead of external link for better UX
    navigation.navigate('TermsOfUse');
  };

  const openPrivacyPolicy = () => {
    // Navigate to Privacy Policy screen instead of external link for better UX
    navigation.navigate('PrivacyPolicy');
  };

  const CustomCheckbox = ({checked, onPress, children}) => (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Icon name="check" size={16} color="#fff" />}
      </View>
      <View style={styles.checkboxTextContainer}>{children}</View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          {/* Header Section with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/Sangam-logo.jpeg')} // Adjust path as needed
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Enter Mobile Number</Text>
            <Text style={styles.subtitle}>
              We'll send you a verification code to confirm your number
            </Text>
          </View>

          {/* Phone Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <View style={styles.phoneInput}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <View style={styles.divider} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                  autoFocus={false}
                />
                {phoneNumber.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setPhoneNumber('')}
                    activeOpacity={1}>
                    <Icon name="x" size={18} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {phoneNumber.length > 0 && phoneNumber.length < 10 && (
              <Text style={styles.errorText}>
                Please enter a valid 10-digit mobile number
              </Text>
            )}
          </View>

          {/* Spacer to push content to bottom */}
          <View style={styles.spacer} />

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Terms and Conditions Checkbox */}
            <CustomCheckbox
              checked={agreeToTerms}
              onPress={() => setAgreeToTerms(!agreeToTerms)}>
              <Text style={styles.checkboxText}>
                I agree to{' '}
                <Text style={styles.linkText} onPress={openTermsOfUse}>
                  Terms of Use
                </Text>{' '}
                &{' '}
                <Text style={styles.linkText} onPress={openPrivacyPolicy}>
                  Privacy Policy
                </Text>
              </Text>
            </CustomCheckbox>

            {/* WhatsApp Updates Checkbox */}
            <CustomCheckbox
              checked={receiveUpdates}
              onPress={() => setReceiveUpdates(!receiveUpdates)}>
              <View style={styles.whatsappContainer}>
                <Text style={styles.checkboxText}>
                  Send me offers & updates on{' '}
                </Text>
                <View style={styles.whatsappBadge}>
                  <Icon name="message-circle" size={14} color="#25D366" />
                  <Text style={styles.whatsappText}>WhatsApp</Text>
                </View>
              </View>
            </CustomCheckbox>

            {/* Get OTP Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (!agreeToTerms || phoneNumber.length !== 10 || loading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={!agreeToTerms || phoneNumber.length !== 10 || loading}
              activeOpacity={0.8}>
              {loading ? (
                <Icon name="loader" size={20} color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Get OTP</Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <Text style={styles.helpText}>
              By continuing, you agree to receive SMS messages from us
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  countryCode: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 16,
    padding: 0,
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 4,
    marginTop: 4,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  bottomSection: {
    paddingTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 12,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    fontWeight: '400',
  },
  linkText: {
    color: '#7B2533',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  whatsappBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginLeft: 4,
  },
  whatsappText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#7B2533',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#7B2533',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helpText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default LoginScreen;
