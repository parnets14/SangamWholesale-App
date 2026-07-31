import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  ToastAndroid,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {ENDPOINTS} from '../../config/api';

const BusinessDetailsScreen = () => {
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const {token: contextToken, login} = useAuth();
  const gstRef = useRef(null);

  // For new users, token & user come via route params (login not called yet)
  // For existing users, token comes from context
  const token = route.params?.token || contextToken;
  const routeUser = route.params?.user;

  const handleContinue = async () => {
    if (!businessName.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('businessName', businessName.trim());
      formData.append('category', 'food');
      if (gstNumber.trim()) {
        formData.append('gstNumber', gstNumber.trim().toUpperCase());
      }

      const response = await fetch(ENDPOINTS.BUSINESS_CREATE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // If this is a new user (token came via route params), call login now
        // so the navigator switches to the logged-in stack
        if (routeUser && route.params?.token) {
          await login(token, {
            ...routeUser,
            businessDetails: {isCompleted: true, category: 'food'},
          });
        }
        if (Platform.OS === 'android') {
          ToastAndroid.show('Business profile created successfully!', ToastAndroid.LONG);
        } else {
          Alert.alert('Success', 'Business profile created successfully!');
        }
        navigation.replace('Splash');
      } else {
        const msg = data.message || 'Failed to create business profile';
        Platform.OS === 'android'
          ? ToastAndroid.show(msg, ToastAndroid.LONG)
          : Alert.alert('Error', msg);
      }
    } catch (error) {
      const msg = 'Network error. Please try again.';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.LONG)
        : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !businessName.trim() || loading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.header}>Enter Business Details</Text>

          <Text style={styles.label}>Your Business Name</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Your Business Name"
            placeholderTextColor="#999"
            returnKeyType="next"
            onSubmitEditing={() => gstRef.current?.focus()}
          />

          <Text style={styles.label}>
            GST Number{' '}
            <Text style={styles.optional}>(Optional)</Text>
          </Text>
          <TextInput
            ref={gstRef}
            style={styles.input}
            value={gstNumber}
            onChangeText={text => setGstNumber(text.toUpperCase())}
            placeholder="e.g. 22ABCDE1234F1Z5"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isButtonDisabled}>
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2A44',
    marginBottom: 40,
  },
  label: {
    fontSize: 18,
    color: '#1A2A44',
    marginBottom: 12,
    fontWeight: '600',
  },
  optional: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 30,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7B2533',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BusinessDetailsScreen;
