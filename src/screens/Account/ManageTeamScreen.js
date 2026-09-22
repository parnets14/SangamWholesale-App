import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const ManageTeamScreen = () => {
  const navigation = useNavigation();

  const MenuItem = ({iconName, title, subtitle, onPress}) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        <Icon name={iconName} size={20} color="#7B2533" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Team</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.menuSection}>
            <MenuItem
              iconName="users"
              title="Team Details"
              subtitle="User Roles, Team Access"
              onPress={() => alert('Navigate to Team Details')}
            />
            <MenuItem
              iconName="user-plus"
              title="Invite Team Member"
              subtitle="Send an invite to join your team"
              onPress={() => alert('Navigate to Invite Team Member')}
            />
            <MenuItem
              iconName="monitor"
              title="Active Session"
              subtitle="Manage devices currently logged in"
              onPress={() => alert('Navigate to Active Session')}
            />
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
    paddingBottom: 20,
  },
  menuSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ManageTeamScreen;
