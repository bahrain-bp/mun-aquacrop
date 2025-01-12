import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For icon support
import { storage } from '../utils/storage';
import { useTheme, themes } from '../components/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_PROD_API_URL;

const UploadCrop: React.FC = () => {
    const router = useRouter();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);  // Manage image URI
    const [isUploading, setIsUploading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false); // State for loading during classification
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Access Required',
                    'Enable location services\nto get crop recommendations'
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        };

        getLocation();
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [loading]);

    if (permission === null) {
        return <View />; // Loading state while waiting for permission response
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const data = await cameraRef.current.takePictureAsync();
                console.log(data);
                setImage(data.uri);  // Set the image URI to show the picture
            } catch (e) {
                console.error('Error taking picture:', e);
            }
        }
    };

    const retakePicture = () => {
        setImage(null); // Reset the image state to null, so we can retake the picture
    };

    const fetchClassification = async (fileName: string): Promise<any> => {
        try {
            const idToken = await storage.getItem('idToken');
            if (!idToken) {
                throw new Error('No ID token found. Please log in again.');
            }    
            const response = await fetch(`${API_URL}/classification?fileName=${fileName}`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('Classification not available yet.');
                    return null; // Indicate no classification yet, allowing pollForClassification to retry
                }

                // For other errors, log and throw a generic error
                console.error(`Fetch classification failed: ${response.status} ${response.statusText}`);
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            return await response.json(); // Contains classification data or empty if not classified
        } catch (error) {
            console.error('Error in fetchClassification:', error);
            return null;
        }
    };

    const pollForClassification = async (fileName: string) => {
        const timeout = 25000; // 25 seconds
        const interval = 2000; // 2 seconds
        const startTime = Date.now();

        const checkRecord = async () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > timeout) {
                return null;
            }

            const record = await fetchClassification(fileName);
            if (record) {
                return record; // Classification result
            }

            return new Promise((resolve) =>
                setTimeout(() => resolve(checkRecord()), interval)
            );
        };

        return checkRecord();
    };

    const uploadImage = async (uri: string) => {
        try {
            setIsUploading(true);
            
            const idToken = await storage.getItem('idToken');
            const accessToken = await storage.getItem('accessToken');

            if (!idToken || !accessToken) {
                throw new Error('No authentication tokens found');
            }

            // Create unique filename using timestamp and random number
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const fileExtension = uri.split('.').pop();
            const fileName = `camera_uploads/image_${timestamp}_${randomId}.${fileExtension}`;
            const fileNameDB = `image_${timestamp}_${randomId}.${fileExtension}`;

            // Prepare metadata
            const metadata = {
                timestamp: new Date().toISOString(),
                source: 'camera-upload',
                location: location ? JSON.stringify(location) : null, // Convert location object to string
            };

            if (typeof metadata.location !== 'string') {
                console.error('Error: Metadata.location is not a string');
            }

            // Get signed URL
            const signedUrlResponse = await fetch(`${API_URL}/Upload/camera`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'X-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName,
                    fileType: 'image/jpeg',
                    metadata,
                }),
            });

            if (!signedUrlResponse.ok) {
                throw new Error('Failed to get signed URL');
            }

            const { uploadURL } = await signedUrlResponse.json();

            // Convert image uri to blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Upload to S3
            await fetch(uploadURL, {
                method: 'PUT',
                body: blob,
                headers: {
                    'Content-Type': 'image/jpeg',
                },
            });

            
            
            setImage(null);
            return fileNameDB; // Return fileName for further use
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert(
                'Upload Failed',
                'Could not upload your image. Please check your internet connection and try again.'
            );
        } finally {
            setIsUploading(false);
        }
    };

    const savePicture = async () => {
        try {
            if (image) {
                const fileNameDB = await uploadImage(image);
                setLoading(true); // Start loading
                if (!fileNameDB) {
                    throw new Error('File upload failed.');
                }
                
                console.log(fileNameDB);
                const classification = await pollForClassification(fileNameDB);
                setLoading(false); // Stop loading
            
                if (classification) {
                    // Navigate to the recommendation page
                    router.push({
                        pathname: '/screens/Recommendation',
                        params: {
                            title: classification.crop,
                            nameEN: classification.nameEN,
                            nameAR: classification.nameAR,
                            imageSource: classification.imageSource,
                            growthStage: classification.stage,
                            kcForCrop: classification.kc,
                            latitude: classification.latitude,
                            longitude: classification.longitude,
                        },
                    });
                }else {
                    Alert.alert(
                        'AI Analysis Failed',
                        'Please ensure:\n• Image is clear\n• Plant is visible\n• Good lighting'
                    );
                }
            } else {
                Alert.alert(
                    'No Image',
                    'Take a picture first'
                );
            }
            
        } catch(error: any) {
            // Reset loading state if applicable
        setIsUploading(false);

        // Log the error for debugging
        console.error('Error in savePicture:', error);

        // Show an alert to the user
        Alert.alert(
            'Processing Error',
            'Connection issue detected.\nPlease try again later.'
        );
        }
    };

    if (loading) {
        // Display loading state when classification is being fetched
        return (
            <Animated.View style={[
                styles.loadingContainer, 
                { backgroundColor: theme.background },
                { opacity: fadeAnim }
            ]}>
                <View style={[styles.loadingContent, { 
                    backgroundColor: theme.card,
                    shadowColor: theme.shadow,
                }]}>
                    {image && (
                        <Image 
                            source={{ uri: image }} 
                            style={styles.loadingImagePreview}
                        />
                    )}
                    <ActivityIndicator size="large" color={theme.accent} style={styles.loadingSpinner} />
                    <Text style={[styles.loadingTitle, { color: theme.text }]}>AI Processing</Text>
                    <Text style={[styles.loadingMessage, { color: theme.subText }]}>
                        Our AI is analyzing your crop image{'\n'}
                        This may take a few moments...
                    </Text>
                </View>
            </Animated.View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {!image ? (
                <CameraView style={styles.camera} type={facing} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.cameraButton, { backgroundColor: theme.card + '80' }]} 
                            onPress={toggleCameraFacing}
                        >
                            <Ionicons name="camera-reverse" size={40} color={theme.text} />
                            <Text style={[styles.buttonText, { color: theme.text }]}>Flip Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.cameraButton, { backgroundColor: theme.card + '80' }]} 
                            onPress={takePicture}
                        >
                            <Ionicons name="camera" size={40} color={theme.text} />
                            <Text style={[styles.buttonText, { color: theme.text }]}>Take Picture</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                <View style={[styles.previewContainer, { backgroundColor: theme.background }]}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <View style={styles.previewButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, { backgroundColor: theme.border }]} 
                            onPress={retakePicture}
                        >
                            <Ionicons name="reload" size={24} color={theme.text} />
                            <Text style={[styles.buttonText, { color: theme.text }]}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.actionButton, 
                                { backgroundColor: theme.accent },
                                isUploading && { opacity: 0.7 }
                            ]}
                            onPress={savePicture}
                            disabled={isUploading}
                        >
                            <Ionicons name="cloud-upload" size={24} color={theme.text} />
                            <Text style={[styles.buttonText, { color: theme.text }]}>
                                {isUploading ? 'Analyzing..' : 'Analyze'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    message: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'transparent',
        padding: 15,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        color: 'white',
    },
    imagePreview: {
        width: '90%',
        height: '70%',
        borderRadius: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
    },
    previewContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 20,
        position: 'absolute',
        bottom: 0,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        width: '45%',
        justifyContent: 'center',
        gap: 10,
    },
    retakeButton: {
        backgroundColor: '#555',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    cameraButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 15,
        borderRadius: 10,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingContent: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: '90%',
    },
    loadingImagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    loadingSpinner: {
        marginVertical: 20,
    },
    loadingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    loadingMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default UploadCrop;
