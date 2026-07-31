// src/screens/TermsOfUseScreen.js
import React from 'react';
import {View, ScrollView, StyleSheet, Linking} from 'react-native';
import {Button, Text} from 'react-native-paper';

const TermsOfUseScreen = ({navigation}) => {
  const handleAccept = () => {
    // Handle terms acceptance logic
    navigation.goBack();
  };

  const openExternalLink = url => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Use</Text>
        <Text style={styles.effectiveDate}>Effective: January 1, 2023</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to Udaan. These Terms of Use govern your use of our
          platform...
        </Text>

        <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You agree to use the platform only for lawful purposes and in
          accordance...
        </Text>

        {/* Add more sections as needed */}

        <Text style={styles.linkText}>
          For our full Privacy Policy, please visit{' '}
          <Text
            style={styles.hyperlink}
            onPress={() => openExternalLink('https://www.udaan.com/privacy')}>
            www.udaan.com/privacy
          </Text>
        </Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleAccept}
          style={styles.button}
          labelStyle={styles.buttonText}>
          I Accept
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.declineButton]}
          labelStyle={styles.declineButtonText}>
          Decline
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Space for buttons
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  effectiveDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  hyperlink: {
    color: '#1a73e8',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderColor: '#d32f2f',
  },
  declineButtonText: {
    color: '#d32f2f',
    fontSize: 16,
  },
});

export default TermsOfUseScreen;
