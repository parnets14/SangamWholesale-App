import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const PoliciesScreen = () => {
  const navigation = useNavigation();
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);

  const toggleReturnPolicy = () => {
    setShowReturnPolicy(!showReturnPolicy);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Policies</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Return Policy Card */}
          <View style={styles.policyCard}>
            <TouchableOpacity
              style={styles.policyHeader}
              onPress={toggleReturnPolicy}>
              <Text style={styles.policyTitle}>Return Policy</Text>
              <Icon
                name={showReturnPolicy ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
            {showReturnPolicy && (
              <View style={styles.policyContent}>
                <Text style={styles.policyText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </Text>
              </View>
            )}
          </View>

          {/* Other Policies Card */}
          <View style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <Text style={styles.policyTitle}>Other Policies</Text>
            </View>
            <View style={styles.policyContent}>
              <Text style={styles.policyText}>
                Here you can find information about other important policies,
                such as privacy policy, terms of service, etc.
              </Text>
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
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
    color: '#ffff',
    flex: 1,
    textAlign: 'left',
  },
  scrollContainer: {
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  policyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  policyContent: {
    padding: 15,
  },
  policyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default PoliciesScreen;
