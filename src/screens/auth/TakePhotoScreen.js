import React, {useState, useEffect} from 'react';
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
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchCamera} from 'react-native-image-picker';

const TakePhotoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {businessName, businessType, frontPhoto} = route.params || {};
  console.log('TakePhotoScreen - businessName:', businessName);
  console.log('TakePhotoScreen - businessType:', businessType);
  console.log('TakePhotoScreen - frontPhoto:', frontPhoto);

  const [backPhoto, setBackPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

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
    return true; // iOS permissions are handled via Info.plist
  };

  const handleTakePhoto = async () => {
    setLoading(true);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera access is required to take a photo.',
      );
      setLoading(false);
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
      saveToPhotos: false,
    };

    launchCamera(options, response => {
      setLoading(false);
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
        setBackPhoto(response.assets[0].uri);
      }
    });
  };

  const handleRetakePhoto = () => {
    setBackPhoto(null);
  };

  const handleContinue = () => {
    // Pass all data to SelectCategoryScreen
    navigation.navigate('SelectCategory', {
      businessName,
      businessType,
      frontPhoto,
      backPhoto,
    });
  };

  const isButtonDisabled = !backPhoto;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#7B2533" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>
            Take{' '}
            {businessType === 'Restaurant'
              ? 'Restaurant'
              : businessType === 'Grocery & Provision Store'
              ? 'Store'
              : businessType === 'Pharmacy'
              ? 'Pharmacy'
              : 'Business'}{' '}
            more Photo
          </Text>
          <Text style={styles.subHeader}>
            Take a photo of the back of your business
          </Text>

          {/* Photo Placeholder or Taken Photo */}
          <View style={styles.photoContainer}>
            {backPhoto ? (
              <View style={styles.photoPreview}>
                <Image source={{uri: backPhoto}} style={styles.takenPhoto} />
                <TouchableOpacity
                  onPress={handleRetakePhoto}
                  style={styles.retakeButton}>
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleTakePhoto}
                style={styles.takePhotoButton}
                disabled={loading}>
                {loading ? (
                  <Text style={styles.takePhotoText}>Preparing Camera...</Text>
                ) : (
                  <>
                    <Icon name="camera-alt" size={40} color="#007AFF" />
                    <Text style={styles.takePhotoText}>Take Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isButtonDisabled}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A2A44',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: '#1A2A44',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  photoContainer: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  takePhotoButton: {
    alignItems: 'center',
  },
  takePhotoText: {
    fontSize: 18,
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
  },
  retakeButton: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  guidelinesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2A44',
    marginBottom: 15,
  },
  guidelineText: {
    fontSize: 16,
    color: '#1A2A44',
    marginBottom: 15,
    fontWeight: '500',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    width: '48%',
  },
  guidelineImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  checkIcon: {
    position: 'absolute',
    bottom: 5,
    left: 5,
  },
  cancelIcon: {
    position: 'absolute',
    bottom: 5,
    left: 5,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7B2533',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#d3d3d3',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TakePhotoScreen;
