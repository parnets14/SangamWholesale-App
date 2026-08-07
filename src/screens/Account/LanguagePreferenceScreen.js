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

const LanguagePreferenceScreen = () => {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('English'); // Default or fetched

  const LanguageOption = ({languageName, isSelected, onPress}) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={styles.languageText}>{languageName}</Text>
      <View style={styles.radioContainer}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Language Preference</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.languageOptionsContainer}>
            <LanguageOption
              languageName="English"
              isSelected={selectedLanguage === 'English'}
              onPress={() => setSelectedLanguage('English')}
            />
            <View style={styles.divider} />
            <LanguageOption
              languageName="Hindi"
              isSelected={selectedLanguage === 'Hindi'}
              onPress={() => setSelectedLanguage('Hindi')}
            />
            <View style={styles.divider} />
            <LanguageOption
              languageName="Tamil"
              isSelected={selectedLanguage === 'Tamil'}
              onPress={() => setSelectedLanguage('Tamil')}
            />
            <View style={styles.divider} />
            <LanguageOption
              languageName="Telugu"
              isSelected={selectedLanguage === 'Telugu'}
              onPress={() => setSelectedLanguage('Telugu')}
            />
            <View style={styles.divider} />
            <LanguageOption
              languageName="Kannada"
              isSelected={selectedLanguage === 'Kannada'}
              onPress={() => setSelectedLanguage('Kannada')}
            />
            <View style={styles.divider} />
            <LanguageOption
              languageName="Malayalam"
              isSelected={selectedLanguage === 'Malayalam'}
              onPress={() => setSelectedLanguage('Malayalam')}
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  languageOptionsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  radioContainer: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7B2533',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#7B2533',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
});

export default LanguagePreferenceScreen;
