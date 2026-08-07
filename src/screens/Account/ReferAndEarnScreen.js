import React from 'react';
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

const ReferAndEarnScreen = () => {
  const navigation = useNavigation();

  const handleReferNow = () => {
    alert('Refer Now functionality');
  };

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer and Earn</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            <Icon name="gift" size={80} color="#7B2533" style={styles.icon} />
            <Text style={styles.mainText}>
              Invite your friends, earn money.
            </Text>
            <Text style={styles.subText}>
              Share your referral code with friends and earn rewards when they
              join and place orders.
            </Text>

            {/* Placeholder for Share Options */}
            <View style={styles.shareOptionsContainer}>
              <Text style={styles.shareText}>
                Share your unique referral link:
              </Text>
              <View style={styles.referralLinkContainer}>
                <Text style={styles.referralLink}>UDAANAPP.COM/REF/XYZ123</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => alert('Copied!')}>
                  <Icon name="copy" size={20} color="#7B2533" />
                </TouchableOpacity>
              </View>
              <Text style={styles.orText}>OR</Text>
              <TouchableOpacity
                style={styles.referNowButton}
                onPress={handleReferNow}>
                <Text style={styles.referNowButtonText}>Refer Now</Text>
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
    backgroundColor: '#F3F4F6',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
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
    color: '#111827',
    flex: 1,
    textAlign: 'left',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  contentContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginBottom: 20,
  },
  mainText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  shareOptionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
  },
  referralLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
  },
  referralLink: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  copyButton: {
    padding: 5,
    marginLeft: 10,
  },
  orText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  referNowButton: {
    backgroundColor: '#7B2533',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#7B2533',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  referNowButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ReferAndEarnScreen;
