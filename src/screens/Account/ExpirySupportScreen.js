import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const ExpirySupportScreen = () => {
  const navigation = useNavigation();
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);

  const handleCallUs = () => {
    const phoneNumber = 'tel:+1234567890'; // Replace with actual support number
    Linking.openURL(phoneNumber);
  };

  const handleCreateReturn = () => {
    // Logic for creating a return
    alert('Create Return pressed!');
  };

  const handleKnowMore = () => {
    setShowPolicyDetails(prevState => !prevState);
  };

  return (
    <>
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FMCG Expiry Returns</Text>
          <TouchableOpacity style={styles.callUsButton} onPress={handleCallUs}>
            <Text style={styles.callUsButtonText}>Call Us</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Main Card: Want to return expiry products? */}
          <View style={styles.returnCard}>
            <View style={styles.returnCardLeft}>
              <Text style={styles.returnCardQuestion}>
                Want to return expiry products?
              </Text>
              <TouchableOpacity
                style={styles.createReturnButton}
                onPress={handleCreateReturn}>
                <Text style={styles.createReturnButtonText}>Create Return</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('../../assets/images/expiry_return_placeholder.png')} // Placeholder image
              style={styles.returnCardImage}
              resizeMode="contain"
            />
          </View>

          {/* Policy Card: Expiry Return Policy */}
          <View style={styles.policyCard}>
            <Text style={styles.policyText}>Expiry Return Policy</Text>
            <TouchableOpacity
              style={styles.knowMoreButton}
              onPress={handleKnowMore}>
              <Text style={styles.knowMoreButtonText}>
                {showPolicyDetails ? 'Know Less' : 'Know More'}
              </Text>
            </TouchableOpacity>

            {showPolicyDetails && (
              <View style={styles.policyDetailsContainer}>
                <Text style={styles.policyDetailQuestion}>
                  Is there a limit on amount of return?
                </Text>
                <Text style={styles.policyDetailAnswer}>
                  No Limit on Amount of Return
                </Text>
                <Text style={styles.policyDetailSubtext}>
                  But you can only return the products that you purchased from
                  udaan.
                </Text>
                <View style={styles.detailDivider} />
                <Text style={styles.policyDetailQuestion}>
                  What is the current acceptable expiry range?
                </Text>
                <Text style={styles.policyDetailAnswer}>
                  Expired on or after 13th August 2025 for
                  <Text style={styles.policyDetailHighlight}>
                    {' '}
                    Edible Categories
                  </Text>
                </Text>
                <Text style={styles.policyDetailSubtext}>
                  Expired on today to 2 months from today
                </Text>
                <Text style={styles.policyDetailAnswer}>
                  Expired on or after 13th December 2025 for
                  <Text style={styles.policyDetailHighlight}>
                    {' '}
                    Non-Edible Categories
                  </Text>
                </Text>
                <Text style={styles.policyDetailSubtext}>
                  Expired on today to 6 months from today
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginLeft: -40, // Adjust to visually center title despite back button
  },
  callUsButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  callUsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B2533',
  },
  scrollContainer: {
    padding: 20,
  },
  returnCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  returnCardLeft: {
    flex: 1,
    paddingRight: 10,
  },
  returnCardQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  createReturnButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  createReturnButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  returnCardImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  policyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  policyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  knowMoreButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  knowMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B2533',
  },
  policyDetailsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  policyDetailQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 5,
  },
  policyDetailAnswer: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  policyDetailHighlight: {
    color: '#7B2533',
  },
  policyDetailSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },
});

export default ExpirySupportScreen;
