// src/screens/PrivacyPolicyScreen.js
import React, {useState} from 'react';
import {View, ScrollView, StyleSheet, Linking, Platform} from 'react-native';
import {Button, Text, Checkbox, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PrivacyPolicyScreen = ({navigation, route}) => {
  const {colors} = useTheme();
  const [expandedSections, setExpandedSections] = useState({});
  const [accepted, setAccepted] = useState(false);

  // For screens that require acceptance (like during onboarding)
  const requiresAcceptance = route.params?.requiresAcceptance || false;

  const toggleSection = sectionId => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleExternalLink = url => {
    Linking.openURL(url).catch(err =>
      console.error('Failed to open URL:', err),
    );
  };

  const handleAccept = () => {
    // Store acceptance in AsyncStorage or your state management
    navigation.goBack();
    if (route.params?.onAccept) {
      route.params.onAccept();
    }
  };

  const policySections = [
    {
      id: 'data-collection',
      title: '1. Data We Collect',
      content: 'We collect information you provide directly, including...',
    },
    {
      id: 'data-use',
      title: '2. How We Use Your Data',
      content: 'Your information helps us provide and improve our services...',
    },
    {
      id: 'data-sharing',
      title: '3. Data Sharing',
      content: 'We may share information with third-party service providers...',
    },
    {
      id: 'security',
      title: '4. Data Security',
      content:
        'We implement appropriate technical and organizational measures...',
    },
    {
      id: 'rights',
      title: '5. Your Rights',
      content:
        'You may access, correct, or delete your personal information...',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon
            name="privacy-tip"
            size={40}
            color={colors.primary}
            style={styles.icon}
          />
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.effectiveDate}>
            Last Updated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.introText}>
          At Udaan, we respect your privacy and are committed to protecting your
          personal data.
        </Text>

        {policySections.map(section => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={styles.sectionTitle}
                onPress={() => toggleSection(section.id)}>
                {section.title}
              </Text>
              <Icon
                name={
                  expandedSections[section.id] ? 'expand-less' : 'expand-more'
                }
                size={24}
                onPress={() => toggleSection(section.id)}
              />
            </View>
            {expandedSections[section.id] && (
              <Text style={styles.sectionContent}>{section.content}</Text>
            )}
          </View>
        ))}

        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactText}>
            For privacy-related questions:{' '}
            <Text
              style={[styles.link, {color: colors.primary}]}
              onPress={() => handleExternalLink('mailto:privacy@udaan.com')}>
              privacy@udaan.com
            </Text>
          </Text>
        </View>
      </ScrollView>

      {requiresAcceptance && (
        <View style={[styles.footer, {borderTopColor: colors.border}]}>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={accepted ? 'checked' : 'unchecked'}
              onPress={() => setAccepted(!accepted)}
              color={colors.primary}
            />
            <Text style={styles.acceptText}>
              I have read and agree to the Privacy Policy
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleAccept}
            disabled={!accepted}
            style={[styles.button, !accepted && styles.disabledButton]}
            labelStyle={styles.buttonLabel}>
            Continue
          </Button>
        </View>
      )}
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
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  effectiveDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionContent: {
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  contactContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    textDecorationLine: 'underline',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  acceptText: {
    marginLeft: 8,
    fontSize: 15,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PrivacyPolicyScreen;
