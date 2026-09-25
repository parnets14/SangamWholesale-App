import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

const UserDetailsScreen = ({navigation, route}) => {
  const {token, user} = route.params || {};
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://sangamwholesale.com/api/user/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
          },
          body: JSON.stringify({fullName, email}),
        },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        // Do NOT call login() yet ? BusinessDetails still needed on auth stack
        // Pass token and updated user forward
        const updatedUser = {
          ...user,
          userDetails: {
            ...user?.userDetails,
            fullName,
            email,
            isCompleted: true,
          },
        };
        navigation.replace('BusinessDetails', {token, user: updatedUser});
      } else {
        setError(data.message || 'Failed to save details. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = fullName.trim().length === 0 || loading;

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.header}>Enter Your Details</Text>

          <Text style={styles.label}>Your Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your Full Name"
            placeholderTextColor="#999"
            returnKeyType="next"
          />

          <Text style={styles.label}>Your Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Optional"
            placeholderTextColor="#999"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isButtonDisabled}>
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
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
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2A44',
    marginBottom: 30,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: '#1A2A44',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7B2533',
    paddingVertical: 15,
    borderRadius: 8,
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
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen;
