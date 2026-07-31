import {ENDPOINTS, IMAGE_BASE} from '../../config/api';
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useAuth} from '../../context/AuthContext';

const ShopKYCScreen = () => {
  const navigation = useNavigation();
  const bottomSheetRef = useRef();
  const {token} = useAuth();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [kyc, setKyc] = useState(null);

  const VideoTutorial = () => {
    Linking.openURL('https://www.youtube.com/watch?v=8v0TbDXR9AY');
  };

  const handleCallUs = () => {
    Linking.openURL('tel:6383626844');
  };

  const documentTypes = [
    {
      id: 'udyam_aadhar',
      backendKey: 'udyamAadhar',
      name: 'Udyam Aadhar',
      required: ['Registration Certificate'],
      icon: 'business',
      time: 'KYC in 10 mins.',
      timeColor: '#10b981',
    },
    {
      id: 'gst_certificate',
      backendKey: 'gstCertificate',
      name: 'GST Certificate',
      required: ['GST Registration Certificate'],
      icon: 'receipt',
      time: 'KYC in 10 mins.',
      timeColor: '#10b981',
    },
    {
      id: 'fssai_registration',
      backendKey: 'fssaiLicense',
      name: 'FSSAI Registration',
      subtitle: '(Food License)',
      required: ['FSSAI License'],
      icon: 'restaurant',
      time: 'KYC in 10 mins.',
      timeColor: '#10b981',
    },
    {
      id: 'drug_license',
      backendKey: 'drugLicense',
      name: 'Drug License',
      required: ['Drug License Certificate'],
      icon: 'local_pharmacy',
      time: 'KYC in 48 hours.',
      timeColor: '#0ea5e9',
    },
    {
      id: 'current_account',
      backendKey: 'currentAccountCheque',
      name: 'Current Account Cheque',
      required: ['Bank Statement'],
      icon: 'account_balance',
      time: 'KYC in 48 hours.',
      timeColor: '#0ea5e9',
    },
    {
      id: 'shop_establishment',
      backendKey: 'shopLicense',
      name: 'Shop & Establishment License',
      required: ['License Certificate'],
      icon: 'store',
      time: 'KYC in 48 hours.',
      timeColor: '#0ea5e9',
    },
    {
      id: 'trade_certificate',
      backendKey: 'tradeCertificate',
      name: 'Trade Certificate / License',
      required: ['Trade License'],
      icon: 'work',
      time: 'KYC in 48 hours.',
      timeColor: '#0ea5e9',
    },
    {
      id: 'other_documents',
      backendKey: 'otherShopDocument',
      name: 'Other Shop Documents',
      required: ['Any Valid Business Document'],
      icon: 'folder',
      time: 'KYC in 48 hours.',
      timeColor: '#0ea5e9',
    },
  ];

  React.useEffect(() => {
    fetchKyc();
  }, []);

  const fetchKyc = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        'https://sangamwholesale.com/api/kyc/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      console.log('data', data);
      if (data.success) setKyc(data.kyc);
      else setKyc(null);
    } catch (e) {
      setKyc(null);
    }
  };

  const handleImagePicker = type => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    const callback = response => {
      if (response.didCancel || response.error) return;
      if (response.assets && response.assets[0]) {
        uploadKycDocument(response.assets[0]);
      }
    };

    if (type === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
    bottomSheetRef.current.close();
  };

  const uploadKycDocument = async imageAsset => {
    if (!selectedDocument || !token) return;
    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    const backendField = selectedDocument.backendKey;
    formData.append('type', backendField);
    formData.append('document', {
      uri: imageAsset.uri,
      name: imageAsset.fileName || 'document.jpg',
      type: imageAsset.type || 'image/jpeg',
    });
    try {
      const response = await fetch(
        'https://sangamwholesale.com/api/kyc/upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );
      const data = await response.json();
      console.log('KYC upload response:', data);
      if (data.success) {
        setUploadProgress(100);
        setIsUploading(false);
        setUploadedImage(imageAsset);
        Alert.alert(
          'Success!',
          `${
            selectedDocument.name
          } uploaded successfully. KYC verification will be completed ${selectedDocument.time.toLowerCase()}.`,
          [{text: 'OK', onPress: () => setSelectedDocument(null)}],
        );
        fetchKyc();
      } else {
        setIsUploading(false);
        Alert.alert('Upload failed', data.message || 'Please try again.');
      }
    } catch (e) {
      setIsUploading(false);
      Alert.alert('Upload failed', 'Please try again.');
    }
  };

  const handleNoDocument = () => {
    Alert.alert(
      'No Document Available',
      'Please contact our support team to proceed with KYC verification without documents. Our team will guide you through alternative verification methods.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Contact Support',
          onPress: () => console.log('Contact support'),
        },
      ],
    );
  };

  const renderBottomSheet = () => (
    <RBSheet
      ref={bottomSheetRef}
      height={400}
      openDuration={250}
      customStyles={{
        container: styles.bottomSheetContainer,
        draggableIcon: styles.bottomSheetDraggable,
      }}>
      <View style={styles.bottomSheetContent}>
        <Text style={styles.bottomSheetTitle}>
          Upload {selectedDocument?.name}
        </Text>

        {/* Required Documents */}
        <View style={styles.requiredSection}>
          <Text style={styles.requiredTitle}>Required Documents:</Text>
          {selectedDocument?.required?.map((doc, index) => (
            <View key={index} style={styles.requiredItem}>
              <Icon name="check-circle" size={16} color="#10b981" />
              <Text style={styles.requiredText}>{doc}</Text>
            </View>
          ))}
        </View>

        {/* Upload Options */}
        <View style={styles.uploadOptions}>
          <TouchableOpacity
            style={styles.uploadOption}
            onPress={() => handleImagePicker('camera')}>
            <View style={styles.uploadOptionIcon}>
              <Icon name="camera-alt" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.uploadOptionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadOption}
            onPress={() => handleImagePicker('gallery')}>
            <View style={styles.uploadOptionIcon}>
              <Icon name="photo-library" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Upload Progress */}
        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Uploading... {uploadProgress}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, {width: `${uploadProgress}%`}]}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => bottomSheetRef.current.close()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </RBSheet>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Shop's KYC</Text>
        {/* Show badge if any KYC doc uploaded */}
        {kyc &&
          (kyc.udyamAadhar ||
            kyc.gstCertificate ||
            kyc.fssaiLicense ||
            kyc.drugLicense ||
            kyc.currentAccountCheque ||
            kyc.shopLicense ||
            kyc.tradeCertificate ||
            kyc.otherShopDocument) && (
            <View style={styles.headerBadge}>
              <Icon name="check" size={16} color="#fff" />
            </View>
          )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadText}>
            Upload <Text style={styles.uploadHighlight}>Any 1</Text> Document
          </Text>
          {/* Show uploaded doc from backend if present */}
          {kyc &&
            [
              kyc.udyamAadhar,
              kyc.gstCertificate,
              kyc.fssaiLicense,
              kyc.drugLicense,
              kyc.currentAccountCheque,
              kyc.shopLicense,
              kyc.tradeCertificate,
              kyc.otherShopDocument,
            ].find(Boolean) && (
              <View style={styles.uploadedImageContainer}>
                <Image
                  source={{
                    uri: `https://sangamwholesale.com/${[
                      kyc.udyamAadhar,
                      kyc.gstCertificate,
                      kyc.fssaiLicense,
                      kyc.drugLicense,
                      kyc.currentAccountCheque,
                      kyc.shopLicense,
                      kyc.tradeCertificate,
                      kyc.otherShopDocument,
                    ].find(Boolean)}`,
                  }}
                  style={styles.uploadedImage}
                />
                <View style={styles.uploadedImageOverlay}>
                  <Icon name="check-circle" size={24} color="#10b981" />
                  <Text style={styles.uploadedImageText}>
                    Document Uploaded
                  </Text>
                </View>
              </View>
            )}
        </View>

        {/* Document List */}
        <View style={styles.documentList}>
          {documentTypes.map((doc, idx) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.documentItem}
              onPress={() => {
                setSelectedDocument(doc);
                bottomSheetRef.current.open();
              }}>
              <View style={styles.documentLeft}>
                <View
                  style={[
                    styles.documentIcon,
                    {backgroundColor: doc.timeColor + '20'},
                  ]}>
                  <Icon
                    name={doc.icon || 'description'}
                    size={24}
                    color={doc.timeColor}
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {doc.name}
                    {doc.subtitle && (
                      <Text style={styles.documentSubtitle}>
                        {' '}
                        {doc.subtitle}
                      </Text>
                    )}
                  </Text>
                  <Text style={[styles.documentTime, {color: doc.timeColor}]}>
                    {doc.time}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          ))}
          {/* No Document Option */}
          <TouchableOpacity
            style={[styles.documentItem, styles.noDocumentItem]}
            onPress={handleNoDocument}>
            <View style={styles.documentLeft}>
              <View style={[styles.documentIcon, {backgroundColor: '#fef3c7'}]}>
                <Icon name="help-outline" size={24} color="#f59e0b" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>
                  I don't have any document
                </Text>
                <Text style={styles.documentSubtext}>
                  Contact support for assistance
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Info Sections */}
        <View style={styles.infoSection}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoTitle}>Why Shop's KYC?</Text>
            <TouchableOpacity onPress={VideoTutorial}>
              <Text style={styles.infoLink}>Watch Video</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.videoPlaceholder}
            onPress={VideoTutorial}>
            <Icon name="play-arrow" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.helpSection} onPress={handleCallUs}>
          <View style={styles.helpIcon}>
            <Icon name="phone" size={20} color="white" />
          </View>
          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>Need any Help?</Text>
            <Text style={styles.helpSubtitle}>Contact Us - Available 24/7</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#3b82f6" />
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderBottomSheet()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  header: {
    backgroundColor: '#7B2533',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffff',
  },
  headerBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  uploadSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
  },
  uploadHighlight: {
    color: '#7B2533',
    fontWeight: '600',
  },
  uploadedImageContainer: {
    marginTop: 16,
    position: 'relative',
  },
  uploadedImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  uploadedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  documentList: {
    backgroundColor: 'white',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  documentTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  documentSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  noDocumentItem: {
    backgroundColor: '#fefcf3',
  },
  infoSection: {
    backgroundColor: '#ffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoLeft: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  infoLink: {
    fontSize: 14,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  videoPlaceholder: {
    width: 50,
    height: 30,
    backgroundColor: '#7B2533',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpSection: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  helpIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#3b82f6',
  },
  bottomSpacing: {
    height: 20,
  },
  // Bottom Sheet Styles
  bottomSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
  },
  bottomSheetDraggable: {
    backgroundColor: '#d1d5db',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  requiredSection: {
    marginBottom: 20,
  },
  requiredTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requiredItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requiredText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  uploadOption: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
  },
  uploadOptionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dbeafe',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  cancelButton: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
});

export default ShopKYCScreen;
