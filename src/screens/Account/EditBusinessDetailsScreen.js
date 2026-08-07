import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  TextInput,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import BottomSheet from 'react-native-raw-bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useAuth} from '../../context/AuthContext';

const {height: windowHeight} = Dimensions.get('window');

const EditBusinessDetailsScreen = () => {
  const navigation = useNavigation();
  const {token} = useAuth();
  const sheetRef = useRef(null);
  const [sheetContent, setSheetContent] = useState(null);
  const [pan, setPan] = useState('');
  const [gst, setGst] = useState('');
  const [fssai, setFssai] = useState('');
  const [selectedGstExempt, setSelectedGstExempt] = useState(null);
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');
  const [weeklyOffSelection, setWeeklyOffSelection] = useState(null);
  const [nameInfo, setNameInfo] = useState({
    name: '',
    generalInfo: '',
  });
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(
          'https://sangamwholesale.com/api/business/get',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();
        if (data.success && data.business) {
          setNameInfo({
            name: data.business.businessName || '',
            generalInfo: data.business.generalInfo || '',
          });
          // Pre-fill GST from registration
          if (data.business.gstNumber) {
            setGst(data.business.gstNumber);
            setSelectedGstExempt('no');
          } else {
            setSelectedGstExempt('yes');
          }
        }
      } catch (error) {
        // silently fail
      } finally {
        setLoadingBusiness(false);
      }
    };
    fetchBusiness();
  }, [token]);

  const openBottomSheet = contentKey => {
    setSheetContent(contentKey);
    sheetRef.current.open();
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      if (datePickerMode === 'start') {
        setVacationStartDate(date);
        console.log('Vacation start date selected:', date);
      } else {
        setVacationEndDate(date);
        console.log('Vacation end date selected:', date);
      }
    } else {
      console.log('Date picker cancelled');
    }
  };

  const formatDate = d => {
    if (!d) return '';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return `${dateObj.getDate().toString().padStart(2, '0')}/$${(
      dateObj.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${dateObj.getFullYear()}`;
  };

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

  const renderHeader = title => (
    <View style={styles.sheetHeader}>
      <Text style={styles.sheetTitle}>{title}</Text>
      <TouchableOpacity
        onPress={() => sheetRef.current.close()}
        style={styles.sheetCloseButton}>
        <Icon name="x" size={24} color="#ffff" />
      </TouchableOpacity>
    </View>
  );

  const renderSheetContent = () => {
    switch (sheetContent) {
      case 'name_general_info':
        return (
          <View style={styles.sheetContentContainer}>
            {renderHeader('Name & General Info')}
            <ScrollView contentContainerStyle={styles.sheetScrollContent}>
              <Text style={styles.sheetSectionTitle}>Name</Text>
              <TextInput
                style={styles.sheetTextInput}
                value={nameInfo.name}
                onChangeText={text => setNameInfo({...nameInfo, name: text})}
                placeholder="Enter Name"
              />
              <Text style={styles.sheetSectionTitle}>General Info</Text>
              <TextInput
                style={[
                  styles.sheetTextInput,
                  {height: 100, textAlignVertical: 'top'},
                ]}
                value={nameInfo.generalInfo}
                onChangeText={text =>
                  setNameInfo({...nameInfo, generalInfo: text})
                }
                placeholder="Enter General Info"
                multiline
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => sheetRef.current.close()}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      case 'pan_gst':
        return (
          <View style={styles.sheetContentContainer}>
            {renderHeader('Manage GSTIN')}
            <ScrollView contentContainerStyle={styles.sheetScrollContent}>
              <Text style={styles.sheetSectionTitle}>GST Number</Text>
              <Text style={styles.gstQuestion}>Do you have a GST number?</Text>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setSelectedGstExempt('no')}>
                <Text style={styles.radioText}>Yes, I have GSTIN</Text>
                <View
                  style={
                    selectedGstExempt === 'no'
                      ? styles.radioSelected
                      : styles.radioUnselected
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setSelectedGstExempt('yes');
                  setGst('');
                }}>
                <Text style={styles.radioText}>No, I am GST exempt</Text>
                <View
                  style={
                    selectedGstExempt === 'yes'
                      ? styles.radioSelected
                      : styles.radioUnselected
                  }
                />
              </TouchableOpacity>

              {selectedGstExempt === 'no' && (
                <>
                  <Text style={styles.sheetSectionTitle}>Enter GSTIN</Text>
                  <TextInput
                    style={styles.sheetTextInput}
                    value={gst}
                    onChangeText={text => setGst(text.toUpperCase())}
                    placeholder="e.g. 22ABCDE1234F1Z5"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    maxLength={15}
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={async () => {
                  try {
                    const formData = new FormData();
                    formData.append('gstNumber', selectedGstExempt === 'no' ? gst.trim() : '');
                    await fetch('https://sangamwholesale.com/api/business/update', {
                      method: 'PUT',
                      headers: {Authorization: `Bearer ${token}`},
                      body: formData,
                    });
                  } catch (e) {}
                  sheetRef.current.close();
                }}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      case 'fssai':
        return (
          <View style={styles.sheetContentContainer}>
            {renderHeader('Manage FSSAI')}
            <ScrollView contentContainerStyle={styles.sheetScrollContent}>
              <TextInput
                style={styles.sheetTextInput}
                value={fssai}
                onChangeText={setFssai}
                placeholder="Enter FSSAI number"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => sheetRef.current.close()}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      case 'tax_certificate':
        return (
          <View style={styles.sheetContentContainer}>
            {renderHeader('Download Tax Certificates')}
            <ScrollView contentContainerStyle={styles.sheetScrollContent}>
              <Text style={styles.infoText}>
                No Latest Certificates Available
              </Text>
              <Text style={styles.subText}>
                Select Year and Quarter Below to Download older certificates
              </Text>
              <Text style={styles.linkText}>
                Why do I need these Certificates?
              </Text>
              {/* Dropdowns for Tax Type, Year, Quarter would go here */}
              <View style={styles.dropdownPlaceholder}>
                <Text style={{color: '#6B7280'}}>Select Tax Type</Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </View>
              <View style={styles.dropdownPlaceholder}>
                <Text style={{color: '#6B7280'}}>
                  Select Year Of Certification
                </Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </View>
              <View style={styles.dropdownPlaceholder}>
                <Text style={{color: '#6B7280'}}>Select Quarter</Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </View>

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => alert('Download Certificate')}>
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      case 'vacation':
        return (
          <View style={styles.sheetContentContainer}>
            {renderHeader('Manage Vacation')}
            <ScrollView contentContainerStyle={styles.sheetScrollContent}>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity
                  style={styles.datePicker}
                  onPress={() => {
                    setDatePickerMode('start');
                    setShowDatePicker(true);
                    console.log('Open Start Date Picker');
                  }}>
                  <Text style={styles.datePickerLabel}>Start Date</Text>
                  <Text style={styles.datePickerValue}>
                    {vacationStartDate
                      ? formatDate(vacationStartDate)
                      : '14/06/2025'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.datePicker}
                  onPress={() => {
                    setDatePickerMode('end');
                    setShowDatePicker(true);
                    console.log('Open End Date Picker');
                  }}>
                  <Text style={styles.datePickerLabel}>End Date</Text>
                  <Text style={styles.datePickerValue}>
                    {vacationEndDate
                      ? formatDate(vacationEndDate)
                      : '15/06/2025'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.howItWorksTitle}>How does it work?</Text>
              <Text style={styles.howItWorksText}>
                • To create a new vacation, select 'Start Date' and 'End Date'
                and click save.
              </Text>
              <Text style={styles.howItWorksText}>
                • To modify a vacation, update date(s) and click save.
              </Text>
              <Text style={styles.howItWorksText}>
                • Maximum allowed duration for setting vacation is 30 days.
              </Text>
              <Text style={styles.howItWorksText}>
                • You are allowed to set vacation for a maximum of 40 days in a
                6 month period (each half of the year). Which is 80 days in a
                year.
              </Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => sheetRef.current.close()}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </ScrollView>
            {showDatePicker && (
              <DateTimePicker
                value={
                  datePickerMode === 'start'
                    ? vacationStartDate
                      ? new Date(vacationStartDate)
                      : new Date()
                    : vacationEndDate
                    ? new Date(vacationEndDate)
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        );
      case 'weekly_off':
        return (
          <View style={styles.sheetContentContainer}>
            {renderHeader('User Details')}
            <ScrollView contentContainerStyle={styles.sheetScrollContent}>
              <View style={styles.weeklyOffHeader}>
                <Text style={styles.weeklyOffQuestion}>
                  Do you keep your shop closed?
                </Text>
                <Image
                  source={require('../../assets/images/shop-closed.png')}
                  style={styles.shopClosedImage}
                />
              </View>
              <Text style={styles.weeklyOffSubTitle}>
                When is my shop open:
              </Text>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setWeeklyOffSelection('open_every_day')}>
                <Text style={styles.radioText}>Open Every Day</Text>
                <View
                  style={
                    weeklyOffSelection === 'open_every_day'
                      ? styles.radioSelected
                      : styles.radioUnselected
                  }
                />
              </TouchableOpacity>

              <Text style={styles.weeklyOffSubTitle}>
                When is my shop closed:
              </Text>
              <View style={styles.daySelectionContainer}>
                {[
                  'Sunday',
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                ].map(day => (
                  <TouchableOpacity
                    key={day}
                    style={styles.dayOption}
                    onPress={() => setWeeklyOffSelection(day.toLowerCase())}>
                    <Text style={styles.dayText}>{day}</Text>
                    <View
                      style={
                        weeklyOffSelection === day.toLowerCase()
                          ? styles.radioSelectedSmall
                          : styles.radioUnselectedSmall
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => sheetRef.current.close()}>
                <Text style={styles.proceedButtonText}>PROCEED</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.menuSection}>
          <MenuItem
            iconName="file-text"
            title="Name & General Info"
            subtitle={
              loadingBusiness
                ? 'Loading...'
                : nameInfo.name || 'Tap to set'
            }
            onPress={() => openBottomSheet('name_general_info')}
          />
          <MenuItem
            iconName="credit-card"
            title="GST Number"
            subtitle={gst ? gst : 'Tap to add'}
            onPress={() => openBottomSheet('pan_gst')}
          />
          <MenuItem
            iconName="calendar"
            title="Weekly Off"
            subtitle="Tap to set"
            onPress={() => openBottomSheet('weekly_off')}
          />
        </View>
      </ScrollView>

      <BottomSheet
        ref={sheetRef}
        height={windowHeight * 0.9} // Use height prop instead of snapPoints
        // Remove initialSnap and callbackNode
        customStyles={{
          container: styles.bottomSheetContainer,
        }}
        onClose={() => setSheetContent(null)} // Use onClose instead of onCloseEnd
      >
        {renderSheetContent()}
      </BottomSheet>

      {/* Remove Animated.View overlay as react-native-raw-bottom-sheet handles it */}
    </SafeAreaView>
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
    marginHorizontal: 5,
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

  // Bottom Sheet Styles
  bottomSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#ffff',
  },
  sheetHeader: {
    backgroundColor: '#7B2533',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffff',
    flex: 1,
    textAlign: 'center',
    marginLeft: 30,
  },
  sheetCloseButton: {
    padding: 5,
  },
  sheetContentContainer: {
    backgroundColor: '#ffff',
    height: windowHeight * 0.9 - 10,
  },
  sheetScrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  sheetSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  sheetTextInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPanButton: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addPanButtonText: {
    color: '#7B2533',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gstQuestion: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  radioUnselected: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  radioSelected: {
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
  infoText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 14,
    color: '#7B2533',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  dropdownPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePicker: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 5,
  },
  datePickerValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  howItWorksText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
    lineHeight: 20,
  },
  weeklyOffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  weeklyOffQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  shopClosedImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  weeklyOffSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
    marginTop: 20,
  },
  daySelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dayOption: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: '48%', // Two columns
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
  },
  radioSelectedSmall: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7B2533',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B2533',
  },
  radioUnselectedSmall: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  proceedButton: {
    backgroundColor: '#7B2533',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  proceedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditBusinessDetailsScreen;
