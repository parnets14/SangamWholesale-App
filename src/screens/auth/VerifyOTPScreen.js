import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {useAuth} from '../../context/AuthContext';

const CELL_COUNT = 6;
const RESEND_TIMEOUT = 15;

const VerifyOTPScreen = ({navigation, route}) => {
  const {phoneNumber} = route.params || {};
  console.log(phoneNumber);
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const {login} = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setCanResend(false);
    setTimer(RESEND_TIMEOUT);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (value.length !== CELL_COUNT) {
      ToastAndroid.show(
        'Please enter a complete 6-digit OTP',
        ToastAndroid.SHORT,
      );
      return;
    }

    try {
      const response = await fetch(
        'https://sangamwholesale.com/api/user/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phoneNumber,
            otp: value,
          }),
        },
      );

      const data = await response.json();
      console.log('API Response:', response.ok, data);

      if (response.ok && data.success) {
        const {user, token} = data;
        console.log('OTP verified successfully:', user, token);

        const profileCompleted = user?.userDetails?.isCompleted;
        const businessCompleted = user?.businessDetails?.isCompleted;

        if (!profileCompleted) {
          // New user ? do NOT call login() yet, navigator must stay on auth stack
          // Pass token/user via route params for later use
          navigation.replace('UserDetails', {phoneNumber, token, user});
        } else if (!businessCompleted) {
          // Profile done but no business yet ? still on auth stack
          navigation.replace('BusinessDetails', {phoneNumber, token, user});
        } else {
          // Fully registered ? now call login() to switch to home stack
          login(token, user);
          navigation.replace('Splash');
        }
      } else {
        console.log('OTP verification failed:', data.message);
        ToastAndroid.show(
          data.message || 'OTP verification failed',
          ToastAndroid.SHORT,
        );
      }
    } catch (err) {
      console.error('Network error during OTP verification:', err);
      ToastAndroid.show('Network error. Please try again.', ToastAndroid.SHORT);
    }
  };

  const handleResendOtp = async () => {
    setValue('');
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
      if (response.ok && data.success) {
        ToastAndroid.showWithGravity(
          `OTP: ${data.otp}`,
          ToastAndroid.LONG,
          ToastAndroid.CENTER,
        );
        ToastAndroid.show('OTP resent successfully!', ToastAndroid.SHORT);
        startTimer();
      } else {
        ToastAndroid.show(
          data.message || 'Failed to resend OTP. Please try again.',
          ToastAndroid.SHORT,
        );
      }
    } catch (err) {
      ToastAndroid.show('Network error. Please try again.', ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <View style={styles.content}>
          {/* Header Section with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/Sangam-logo.jpeg')} // Adjust path as needed
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{' '}
              <Text style={styles.phoneHighlight}>+91 {phoneNumber}</Text>
            </Text>
          </View>

          {/* OTP Input Section */}
          <View style={styles.inputSection}>
            <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({index, symbol, isFocused}) => (
                <View
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayoutHandler(index)}>
                  <Text style={styles.cellText}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />
            {value.length > 0 && value.length < CELL_COUNT && (
              <Text style={styles.errorText}>
                Please enter a complete 6-digit OTP
              </Text>
            )}
          </View>

          {/* Resend OTP Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
                <Text style={styles.resendButton}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timer}>Resend in {timer}s</Text>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.button,
              value.length !== CELL_COUNT && styles.buttonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={value.length !== CELL_COUNT}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  phoneHighlight: {
    fontWeight: '600',
    color: '#7B2533',
  },
  inputSection: {
    marginBottom: 32,
    width: '100%',
  },
  codeFieldRoot: {
    marginTop: 20,
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  focusCell: {
    borderColor: '#7B2533',
    backgroundColor: '#fff5f5',
  },
  cellText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 15,
    color: '#6b7280',
  },
  resendButton: {
    fontSize: 15,
    color: '#7B2533',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timer: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#7B2533',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#7B2533',
    shadowOffset: {width: 0, height: 4},
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
});

export default VerifyOTPScreen;
