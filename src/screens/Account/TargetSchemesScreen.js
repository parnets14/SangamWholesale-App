import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const TargetSchemesScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

  return (
    <>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TARGET SCHEMES</Text>
          <Image
            source={require('../../assets/images/target_icon.png')} // Placeholder image for target
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'active' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('active')}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'active' && styles.activeTabButtonText,
              ]}>
              Active Schemes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'past' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('past')}>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'past' && styles.activeTabButtonText,
              ]}>
              Past Schemes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.noSchemesContainer}>
            <Text style={styles.noSchemesText}>
              No schemes available right now.
            </Text>
            <Text style={styles.noSchemesText}>Please check again later.</Text>
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
    backgroundColor: '#a81e8c', // Dark purple from image
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 150,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginLeft: 10,
  },
  headerImage: {
    width: 80,
    height: 80,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: -30, // Overlap with header
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#6a1b9a', // Darker purple for active tab
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6a1b9a',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSchemesContainer: {
    alignItems: 'center',
  },
  noSchemesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TargetSchemesScreen;
