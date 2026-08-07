import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchCamera} from 'react-native-image-picker';

const {width} = Dimensions.get('window');

const BussinessPhotosScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {businessName, businessType} = route.params || {};
  console.log('businessName', businessName);
  console.log('businessType', businessType);
  const [photo, setPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take a photo.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    setIsProcessing(true);
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Camera access is required to take a photo.',
        );
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: false,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      launchCamera(options, response => {
        setIsProcessing(false);
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log(
            'Camera Error: ',
            response.errorCode,
            response.errorMessage,
          );
          Alert.alert('Error', 'Failed to open camera. Please try again.');
        } else if (response.assets && response.assets.length > 0) {
          setPhoto(response.assets[0].uri);
        }
      });
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
  };

  const handleContinue = () => {
    navigation.navigate('TakePhoto', {
      businessName,
      businessType,
      frontPhoto: photo,
    });
  };

  const isButtonDisabled = !photo && businessType !== 'caterer';

  const getBusinessTypeName = () => {
    switch (businessType) {
      case 'Restaurant':
        return 'Restaurant';
      case 'Grocery & Provision Store':
        return 'Store';
      case 'Pharmacy':
        return 'Pharmacy';
      case 'PG':
        return 'PG';
      default:
        return 'Business';
    }
  };

  // Placeholder Image Component
  const PlaceholderImage = ({type, isCorrect}) => {
    const getPlaceholderContent = () => {
      switch (type) {
        case 'correctFront':
          return {
            icon: 'storefront',
            text: 'Full Front View\nwith Name Board',
            iconColor: '#28A745',
          };
        case 'incorrectFront':
          return {
            icon: 'store',
            text: 'Partial View\nNo Name Board',
            iconColor: '#DC3545',
          };
        case 'correctDay':
          return {
            icon: 'wb-sunny',
            text: 'Daytime Photo\nGood Lighting',
            iconColor: '#28A745',
          };
        case 'incorrectNight':
          return {
            icon: 'nights-stay',
            text: 'Night Photo\nPoor Lighting',
            iconColor: '#DC3545',
          };
      }
    };

    const placeholder = getPlaceholderContent();

    return (
      <View style={styles.imageWrapper}>
        <View
          style={[
            styles.placeholderContainer,
            {backgroundColor: placeholder.bgColor},
          ]}>
          <Icon
            name={placeholder.icon}
            size={28}
            color={placeholder.iconColor}
            style={styles.placeholderIcon}
          />
          <Text style={styles.placeholderText}>{placeholder.text}</Text>
        </View>
        <Icon
          name={isCorrect ? 'check-circle' : 'cancel'}
          size={24}
          color={isCorrect ? '#28A745' : '#DC3545'}
          style={styles.statusIcon}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      {/* Custom Header */}
      {/* <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Business Photo</Text>
        <View style={styles.headerRightPlaceholder} />
      </View> */}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.screenTitle}>
            Take {getBusinessTypeName()} Front Photo
          </Text>
          <Text style={styles.subHeader}>*Ignore if you are a caterer</Text>

          {/* Photo Container */}
          <View style={styles.photoContainer}>
            {photo ? (
              <View style={styles.photoPreview}>
                <Image source={{uri: photo}} style={styles.takenPhoto} />
                <TouchableOpacity
                  onPress={handleRetakePhoto}
                  style={styles.retakeButton}
                  activeOpacity={0.7}>
                  <Icon name="camera-alt" size={20} color="#fff" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleTakePhoto}
                style={styles.takePhotoButton}
                activeOpacity={0.7}
                disabled={isProcessing}>
                {isProcessing ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.takePhotoText}>
                      Preparing Camera...
                    </Text>
                  </View>
                ) : (
                  <>
                    <Icon name="camera-alt" size={40} color="#007AFF" />
                    <Text style={styles.takePhotoText}>Take Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Guidelines Section */}
          <View style={styles.guidelinesSection}>
            <Text style={styles.guidelinesHeader}>Important Guidelines</Text>

            <Text style={styles.guidelineText}>
              Photo must show full {getBusinessTypeName()} front with name board
            </Text>
            <View style={styles.imageRow}>
              <PlaceholderImage type="correctFront" isCorrect={true} />
              <PlaceholderImage type="incorrectFront" isCorrect={false} />
            </View>

            <Text style={styles.guidelineText}>
              Photo must be taken during daylight hours
            </Text>
            <View style={styles.imageRow}>
              <PlaceholderImage type="correctDay" isCorrect={true} />
              <PlaceholderImage type="incorrectNight" isCorrect={false} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isButtonDisabled}
          activeOpacity={0.7}>
          <Text style={styles.buttonText}>
            {isProcessing ? 'Processing...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Header Styles
  headerContainer: {
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 24,
  },
  // Content Styles
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2A44',
    marginTop: 20,
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  photoContainer: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  takePhotoButton: {
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  takePhotoText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 10,
    fontWeight: '500',
  },
  photoPreview: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  takenPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  // Guidelines Section
  guidelinesSection: {
    marginTop: 10,
  },
  guidelinesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2A44',
    marginBottom: 15,
  },
  guidelineText: {
    fontSize: 15,
    color: '#1A2A44',
    marginBottom: 12,
    fontWeight: '500',
    lineHeight: 20,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  imageWrapper: {
    position: 'relative',
    width: '48%',
    height: 120,
  },
  placeholderContainer: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  placeholderIcon: {
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    color: '#333',
  },
  statusIcon: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  // Button Container
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7B2533',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#d3d3d3',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BussinessPhotosScreen;
