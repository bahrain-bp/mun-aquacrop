import * as Location from 'expo-location';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For icon support
import { storage } from '../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_PROD_API_URL;

const UploadCrop: React.FC = () => {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);  // Manage image URI
    const [isUploading, setIsUploading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location access is required for this feature.');
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

            Alert.alert('Success', 'Image uploaded successfully!');
            setImage(null);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const savePicture = async () => {
        if (image) {
            await uploadImage(image);
        }
    };

    return (
        <View style={styles.container}>
            {!image ? (
                <CameraView style={styles.camera} type={facing} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
                            <Ionicons name="camera-reverse" size={40} color="white" />
                            <Text style={styles.buttonText}>Flip Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                            <Ionicons name="camera" size={40} color="white" />
                            <Text style={styles.buttonText}>Take Picture</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <View style={styles.previewButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.retakeButton]} 
                            onPress={retakePicture}
                        >
                            <Ionicons name="reload" size={24} color="white" />
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.saveButton]}
                            onPress={savePicture}
                            disabled={isUploading}
                        >
                            <Ionicons name="cloud-upload" size={24} color="white" />
                            <Text style={styles.buttonText}>
                                {isUploading ? 'Uploading...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default UploadCrop;
