// CreateAddressScreen.js
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useAuth} from '../../context/AuthContext';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAHFoepvVjrlMUctcC4wn_VRpOznZBzmhA';

const {height} = Dimensions.get('window');

const NewAddressScreen = ({navigation, route}) => {
  const {token} = useAuth();
  const editAddress = route?.params?.address;
  const isEdit = route?.params?.isEdit;

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLunchPicker, setShowLunchPicker] = useState({
    type: '',
    show: false,
  });
  const [gstVerified, setGstVerified] = useState(false);
  const [gstVerifying, setGstVerifying] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
  });
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const placesRef = useRef(null);
  // mapRef kept for future map re-integration

  const [formData, setFormData] = useState({
    shopName: '',
    shopNoRoad: '',
    areaName: '',
    pincode: '',
    city: '',
    deliveryContact: '',
    saveAddressAs: '',
    selectedTime: '',
    weeklySchedule: {
      Sunday: 'open',
      Monday: 'open',
      Tuesday: 'open',
      Wednesday: 'open',
      Thursday: 'open',
      Friday: 'open',
      Saturday: 'open',
    },
    lunchStart: '',
    lunchEnd: '',
    gstOption: 'i_want_gst',
    gstin: '',
  });

  const steps = ['Address', 'Timings', 'GST'];

  const timeOptions = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
  ];

  const lunchOptions = [
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
  ];

  // Step indicator configuration
  const stepIndicatorStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 35,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#7B2533',
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: '#7B2533',
    stepStrokeUnFinishedColor: '#CBD5E0',
    separatorFinishedColor: '#7B2533',
    separatorUnFinishedColor: '#CBD5E0',
    stepIndicatorFinishedColor: '#7B2533',
    stepIndicatorUnFinishedColor: '#CBD5E0',
    stepIndicatorCurrentColor: '#7B2533',
    stepIndicatorLabelFontSize: 12,
    currentStepIndicatorLabelFontSize: 12,
    stepIndicatorLabelCurrentColor: '#FFFFFF',
    stepIndicatorLabelFinishedColor: '#FFFFFF',
    stepIndicatorLabelUnFinishedColor: '#718096',
    labelColor: '#718096',
    labelSize: 12,
    currentStepLabelColor: '#7B2533',
  };

  useEffect(() => {
    // Silently get location in background � doesn't block screen render
    getCurrentLocation();
    // Delay map mount to avoid blank screen on init
    const timer = setTimeout(() => setMapReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isEdit && editAddress) {
      setFormData({
        shopName: editAddress.shopName || '',
        shopNoRoad: editAddress.shopNumber || '',
        areaName: editAddress.areaName || '',
        pincode: editAddress.pincode || '',
        city: editAddress.city || '',
        deliveryContact: editAddress.deliveryContact || '',
        saveAddressAs: editAddress.saveAddressAs || '',
        selectedTime: editAddress.shopOpenTime || '',
        weeklySchedule: editAddress.openClosedDays || {
          Sunday: 'open',
          Monday: 'open',
          Tuesday: 'open',
          Wednesday: 'open',
          Thursday: 'open',
          Friday: 'open',
          Saturday: 'open',
        },
        lunchStart: editAddress.lunchTime?.lunchStart || '',
        lunchEnd: editAddress.lunchTime?.lunchEnd || '',
        gstOption: editAddress.gstOption || 'i_want_gst',
        gstin: editAddress.gstin || '',
      });
      if (editAddress.location) {
        setSelectedLocation(editAddress.location);
      }
    }
  }, [isEdit, editAddress]);

  const getCurrentLocation = () => {
    try {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setSelectedLocation({latitude, longitude});
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01},
              1000,
            );
          }
        },
        error => {
          console.log('Location error (silent):', error.message);
          // Keep default Bangalore coords, no alert
        },
        {enableHighAccuracy: false, timeout: 10000, maximumAge: 30000},
      );
    } catch (e) {
      console.log('Geolocation unavailable:', e.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleWeeklyScheduleChange = (day, status) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: status,
      },
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        if (!formData.shopName.trim())
          newErrors.shopName = 'Shop name is required';
        if (!formData.shopNoRoad.trim())
          newErrors.shopNoRoad = 'Shop number & road is required';
        if (!formData.areaName.trim())
          newErrors.areaName = 'Area name is required';
        if (
          !formData.pincode.trim() ||
          formData.pincode.length !== 6 ||
          isNaN(formData.pincode)
        ) {
          newErrors.pincode = 'Valid 6-digit pincode is required';
        }
        if (!formData.saveAddressAs.trim())
          newErrors.saveAddressAs = 'Address label is required';
        break;
      case 1:
        if (!formData.selectedTime)
          newErrors.selectedTime = 'Please select a time';
        if (!formData.lunchStart && formData.lunchEnd)
          newErrors.lunchStart = 'Please select lunch start time';
        if (formData.lunchStart && !formData.lunchEnd)
          newErrors.lunchEnd = 'Please select lunch end time';
        break;
      case 2:
        if (formData.gstOption === 'i_want_gst' && !formData.gstin.trim()) {
          newErrors.gstin = 'GSTIN is required';
        } else if (formData.gstOption === 'i_want_gst' && !gstVerified) {
          newErrors.gstin = 'Please verify GSTIN';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (validateStep()) {
      setIsLoading(true);
      const addressData = {
        shopName: formData.shopName,
        shopNumber: formData.shopNoRoad,
        areaName: formData.areaName,
        pincode: formData.pincode,
        city: formData.city,
        town: formData.city,
        deliveryContact: formData.deliveryContact,
        saveAddress: true,
        default: true,
        shopOpenTime: formData.selectedTime,
        openClosedDays: formData.weeklySchedule,
        lunchTime: {
          lunchStart: formData.lunchStart,
          lunchEnd: formData.lunchEnd,
        },
        location: selectedLocation,
      };
      try {
        let response, data;
        if (isEdit && editAddress && editAddress._id) {
          // PUT for update
          response = await fetch(
            `https://sangamwholesale.com/api/addresses/${editAddress._id}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(addressData),
            },
          );
          data = await response.json();
        } else {
          // POST for new
          response = await fetch(
            'https://sangamwholesale.com/api/addresses/',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(addressData),
            },
          );
          data = await response.json();
        }
        setIsLoading(false);
        if (data.success) {
          Alert.alert(
            'Success',
            isEdit
              ? 'Address updated successfully!'
              : 'Address created successfully!',
            [{text: 'OK', onPress: () => navigation.goBack()}],
          );
        } else {
          Alert.alert('Error', data.message || 'Failed to save address');
        }
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to save address. Please try again.');
      }
    }
  };

  const verifyGST = async () => {
    if (!formData.gstin.trim()) {
      Alert.alert('Error', 'Please enter GSTIN');
      return;
    }

    setGstVerifying(true);
    // Simulate GST verification API call
    setTimeout(() => {
      setGstVerifying(false);
      setGstVerified(true);
      Alert.alert('Success', 'GSTIN verified successfully!');
    }, 2000);
  };

  const renderTimePicker = () => (
    <Modal
      visible={showTimePicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTimePicker(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={timeOptions}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  formData.selectedTime === item && styles.selectedTimeOption,
                ]}
                onPress={() => {
                  handleInputChange('selectedTime', item);
                  setShowTimePicker(false);
                }}>
                <Text
                  style={[
                    styles.timeOptionText,
                    formData.selectedTime === item &&
                      styles.selectedTimeOptionText,
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderLunchPicker = () => (
    <Modal
      visible={showLunchPicker.show}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLunchPicker({type: '', show: false})}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select{' '}
              {showLunchPicker.type === 'start' ? 'Lunch Start' : 'Lunch End'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowLunchPicker({type: '', show: false})}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={lunchOptions}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.timeOption}
                onPress={() => {
                  const field =
                    showLunchPicker.type === 'start'
                      ? 'lunchStart'
                      : 'lunchEnd';
                  handleInputChange(field, item);
                  setShowLunchPicker({type: '', show: false});
                }}>
                <Text style={styles.timeOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );


  const renderAddressStep = () => (
    <View style={{flex: 1}}>
      {/* Google Places OUTSIDE ScrollView to avoid nested VirtualizedList warning */}
      <View style={{paddingHorizontal: 16, paddingTop: 12, zIndex: 99}}>
        <Text style={styles.label}>Search Location</Text>
        <GooglePlacesAutocomplete
          placeholder="Search area, street, landmark..."
          fetchDetails={true}
          predefinedPlaces={[]}
          minLength={2}
          debounce={300}
          textInputProps={{
            autoFocus: false,
            blurOnSubmit: false,
            placeholderTextColor: '#9CA3AF',
          }}
          onPress={(data, details = null) => {
            if (!details) {
              console.log('No details returned for:', data?.description);
              return;
            }
            const components = details.address_components || [];
            console.log('Address components:', components.map(c => ({name: c.long_name, types: c.types})));

            let area = '';
            let city = '';
            let pincode = '';
            let road = '';

            components.forEach(c => {
              const types = c.types;
              if (types.includes('route')) {
                road = c.long_name;
              }
              if (
                types.includes('sublocality_level_1') ||
                types.includes('sublocality') ||
                types.includes('neighborhood')
              ) {
                if (!area) area = c.long_name;
              }
              if (types.includes('locality')) {
                city = c.long_name;
              }
              if (types.includes('postal_code')) {
                pincode = c.long_name;
              }
            });

            // Fallbacks
            if (!area) area = data?.structured_formatting?.secondary_text?.split(',')[0] || '';
            if (!city) {
              const admin = components.find(c => c.types.includes('administrative_area_level_2'));
              if (admin) city = admin.long_name;
            }

            console.log('Parsed ? area:', area, '| city:', city, '| pincode:', pincode);

            if (area) handleInputChange('areaName', area);
            if (city) handleInputChange('city', city);
            if (pincode) handleInputChange('pincode', pincode);
            // Fill shopNoRoad with road name or full formatted address
            const roadValue = road || details.formatted_address || '';
            if (roadValue) handleInputChange('shopNoRoad', roadValue);
          }}
          onFail={error => console.log('GooglePlaces error:', error)}
          onNotFound={() => console.log('GooglePlaces: no results')}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          styles={{
            container: {flex: 0, zIndex: 99},
            textInputContainer: {
              backgroundColor: '#fff',
              borderWidth: 1.5,
              borderColor: '#7B2533',
              borderRadius: 10,
              paddingHorizontal: 8,
            },
            textInput: {
              fontSize: 15,
              color: '#111827',
              backgroundColor: '#fff',
              height: 48,
            },
            listView: {
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 10,
              marginTop: 4,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.15,
              shadowRadius: 4,
              zIndex: 999,
            },
            row: {
              paddingVertical: 13,
              paddingHorizontal: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            },
            description: {fontSize: 14, color: '#374151'},
            poweredContainer: {display: 'none'},
          }}
          enablePoweredByContainer={false}
          renderRow={rowData => (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="place" size={14} color="#7B2533" style={{marginRight: 8}} />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 14, color: '#111827', fontWeight: '500'}} numberOfLines={1}>
                  {rowData.structured_formatting?.main_text || rowData.description}
                </Text>
                <Text style={{fontSize: 12, color: '#6B7280', marginTop: 1}} numberOfLines={1}>
                  {rowData.structured_formatting?.secondary_text || ''}
                </Text>
              </View>
            </View>
          )}
        />
        <Text style={styles.hintText}>
          Type your area or street to auto-fill address fields below
        </Text>
      </View>

      {/* Rest of form in ScrollView � NO nested FlatList issue */}
      <ScrollView
        style={styles.stepContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={styles.formGroup}>
          <Text style={styles.label}>Shop Name on the Board</Text>
          <TextInput
            style={[styles.input, errors.shopName && styles.inputError]}
            value={formData.shopName}
            onChangeText={text => handleInputChange('shopName', text)}
            placeholder="Shop Name on the Board"
            placeholderTextColor="#9CA3AF"
          />
          {errors.shopName && <Text style={styles.errorText}>{errors.shopName}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Shop No & Road</Text>
          <TextInput
            style={[styles.input, errors.shopNoRoad && styles.inputError]}
            value={formData.shopNoRoad}
            onChangeText={text => handleInputChange('shopNoRoad', text)}
            placeholder="Shop No & Road"
            placeholderTextColor="#9CA3AF"
          />
          {errors.shopNoRoad && <Text style={styles.errorText}>{errors.shopNoRoad}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Area Name</Text>
          <TextInput
            style={[styles.input, errors.areaName && styles.inputError]}
            value={formData.areaName}
            onChangeText={text => handleInputChange('areaName', text)}
            placeholder="Area Name"
            placeholderTextColor="#9CA3AF"
          />
          {errors.areaName && <Text style={styles.errorText}>{errors.areaName}</Text>}
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
            <Text style={styles.label}>Pincode</Text>
            <TextInput
              style={[styles.input, errors.pincode && styles.inputError]}
              value={formData.pincode}
              onChangeText={text => handleInputChange('pincode', text)}
              placeholder="Pincode"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
            />
            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
          </View>
          <View style={[styles.formGroup, {flex: 1, marginLeft: 10}]}>
            <Text style={styles.label}>City / Town</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={text => handleInputChange('city', text)}
              placeholder="City / Town"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Delivery Contact</Text>
          <TextInput
            style={styles.input}
            value={formData.deliveryContact}
            onChangeText={text => handleInputChange('deliveryContact', text)}
            placeholder="Contact"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Save Address As</Text>
          <TextInput
            style={[styles.input, errors.saveAddressAs && styles.inputError]}
            value={formData.saveAddressAs}
            onChangeText={text => handleInputChange('saveAddressAs', text)}
            placeholder="Home, Office, Other"
            placeholderTextColor="#9CA3AF"
          />
          {errors.saveAddressAs && <Text style={styles.errorText}>{errors.saveAddressAs}</Text>}
        </View>
      </ScrollView>
    </View>
  );

  const renderTimingsStep = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Select Time</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.selectInput,
            errors.selectedTime && styles.inputError,
          ]}
          onPress={() => setShowTimePicker(true)}>
          <Text
            style={[
              styles.selectText,
              !formData.selectedTime && styles.placeholder,
            ]}>
            {formData.selectedTime || 'Select Time'}
          </Text>
          <Icon name="keyboard-arrow-down" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        {errors.selectedTime && (
          <Text style={styles.errorText}>{errors.selectedTime}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Open / Closed Days</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OPEN CLOSED</Text>
          </View>
        </View>

        {Object.keys(formData.weeklySchedule).map(day => (
          <View key={day} style={styles.dayRow}>
            <Text style={styles.dayText}>{day}</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => handleWeeklyScheduleChange(day, 'open')}>
                <View
                  style={[
                    styles.radio,
                    formData.weeklySchedule[day] === 'open' &&
                      styles.radioSelected,
                  ]}>
                  {formData.weeklySchedule[day] === 'open' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>Open</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => handleWeeklyScheduleChange(day, 'closed')}>
                <View
                  style={[
                    styles.radio,
                    formData.weeklySchedule[day] === 'closed' &&
                      styles.radioSelected,
                  ]}>
                  {formData.weeklySchedule[day] === 'closed' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>Closed</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.formGroup}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Lunch Time</Text>
          <Icon name="schedule" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={[
              styles.input,
              styles.selectInput,
              {flex: 1, marginRight: 10},
              errors.lunchStart && styles.inputError,
            ]}
            onPress={() => setShowLunchPicker({type: 'start', show: true})}>
            <Text
              style={[
                styles.selectText,
                !formData.lunchStart && styles.placeholder,
              ]}>
              {formData.lunchStart || 'Lunch Start'}
            </Text>
            <Icon name="keyboard-arrow-down" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.input,
              styles.selectInput,
              {flex: 1, marginLeft: 10},
              errors.lunchEnd && styles.inputError,
            ]}
            onPress={() => setShowLunchPicker({type: 'end', show: true})}>
            <Text
              style={[
                styles.selectText,
                !formData.lunchEnd && styles.placeholder,
              ]}>
              {formData.lunchEnd || 'Lunch End'}
            </Text>
            <Icon name="keyboard-arrow-down" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        {errors.lunchStart && (
          <Text style={styles.errorText}>{errors.lunchStart}</Text>
        )}
        {errors.lunchEnd && (
          <Text style={styles.errorText}>{errors.lunchEnd}</Text>
        )}
      </View>
    </ScrollView>
  );

  const renderGSTStep = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Select GST Option</Text>

      <View style={styles.gstOptions}>
        <TouchableOpacity
          style={[
            styles.gstOption,
            formData.gstOption === 'i_want_gst' && styles.selectedGstOption,
          ]}
          onPress={() => handleInputChange('gstOption', 'i_want_gst')}>
          <Text style={styles.gstOptionText}>I want GST invoice</Text>
          <View
            style={[
              styles.radio,
              formData.gstOption === 'i_want_gst' && styles.radioSelected,
            ]}>
            {formData.gstOption === 'i_want_gst' && (
              <View style={styles.radioInner} />
            )}
          </View>
        </TouchableOpacity>

        {formData.gstOption === 'i_want_gst' && (
          <View style={styles.gstInputContainer}>
            <View style={styles.gstInputRow}>
              <TextInput
                style={[styles.gstInput, errors.gstin && styles.inputError]}
                value={formData.gstin}
                onChangeText={text => handleInputChange('gstin', text)}
                placeholder="Enter GSTIN"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  gstVerifying && styles.disabledButton,
                ]}
                onPress={verifyGST}
                disabled={gstVerifying}>
                {gstVerifying ? (
                  <ActivityIndicator size="small" color="#7B2533" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
            {errors.gstin && (
              <Text style={styles.errorText}>{errors.gstin}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!formData.gstin || !gstVerified) && styles.disabledButton,
              ]}
              disabled={!formData.gstin || !gstVerified}
              onPress={() => Alert.alert('Success', 'GST details confirmed!')}>
              <Text
                style={[
                  styles.confirmButtonText,
                  (!formData.gstin || !gstVerified) &&
                    styles.disabledButtonText,
                ]}>
                {gstVerified ? 'Confirmed' : 'Confirm'}
              </Text>
              {gstVerified && <Icon name="check" size={16} color="#10B981" />}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.gstOption,
            formData.gstOption === 'i_do_not_want_gst' &&
              styles.selectedGstOption,
          ]}
          onPress={() => handleInputChange('gstOption', 'i_do_not_want_gst')}>
          <Text style={styles.gstOptionText}>I do not want GST invoice</Text>
          <View
            style={[
              styles.radio,
              formData.gstOption === 'i_do_not_want_gst' &&
                styles.radioSelected,
            ]}>
            {formData.gstOption === 'i_do_not_want_gst' && (
              <View style={styles.radioInner} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderAddressStep();
      case 1:
        return renderTimingsStep();
      case 2:
        return renderGSTStep();
      default:
        return null;
    }
  };

  const handleEditAddress = address => {
    navigation.navigate('NewAddress', {address, isEdit: true});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" backgroundColor="#7B2533" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={currentStep === 0 ? () => navigation.goBack() : handleBack}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Address</Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <StepIndicator
          customStyles={stepIndicatorStyles}
          currentPosition={currentStep}
          labels={steps}
          stepCount={steps.length}
        />
      </View>

      {/* Step Content */}
      <View style={styles.content}>{renderStepContent()}</View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, isLoading && styles.disabledButton]}
          onPress={currentStep === steps.length - 1 ? handleFinish : handleNext}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {renderTimePicker()}
      {renderLunchPicker()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  stepIndicatorContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 2,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  deliverButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deliverButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  // Search box styles
  searchBoxContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchInput: {
    fontSize: 14,
    color: '#2D3748',
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingLeft: 36,
    height: 44,
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    top: 12,
    zIndex: 1,
  },
  searchListView: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    elevation: 4,
  },
  searchRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchDescription: {
    fontSize: 13,
    color: '#2D3748',
  },
  detectLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detectLocationText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#7B2533',
    fontWeight: '600',
  },
  selectLocationBtn: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  selectLocationText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  locationCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#2D3748',
  },
  inputError: {
    borderColor: '#7B2533',
  },
  disabledInput: {
    backgroundColor: '#F7FAFC',
    color: '#718096',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: '#2D3748',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#7B2533',
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  badge: {
    backgroundColor: '#C6F6D5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#22543D',
  },
  dayRow: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dayText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#7B2533',
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#7B2533',
  },
  radioText: {
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectedTimeOption: {
    backgroundColor: '#7B2533',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#2D3748',
  },
  selectedTimeOptionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  gstOptions: {
    marginTop: 16,
  },
  gstOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  selectedGstOption: {
    borderWidth: 2,
    borderColor: '#7B2533',
  },
  gstOptionText: {
    fontSize: 16,
    color: '#2D3748',
  },
  gstInputContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  gstInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gstInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#2D3748',
    marginRight: 12,
  },
  verifyButton: {
    backgroundColor: '#7B2533',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CBD5E0',
  },
  disabledButtonText: {
    color: '#718096',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  continueButton: {
    backgroundColor: '#7B2533',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewAddressScreen;
