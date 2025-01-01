import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from 'react-native-vector-icons'; // For icon support

const UploadCrop: React.FC = () => {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const [image, setImage] = useState<string | null>(null);  // Manage image URI

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

    const savePicture = () => {
        // Save functionality here
        console.log('Saving image', image);
        // For now, we just log the image URI, you can add actual save functionality (e.g., saving to gallery)
    };

    return (
        <View style={styles.container}>
            {!image ? (
                // Camera View is shown if no image is taken
                <CameraView style={styles.camera} type={facing} ref={cameraRef}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                            <Ionicons name="camera-reverse" size={40} color="white" />
                            <Text style={styles.text}>Flip Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={takePicture}>
                            <Ionicons name="camera" size={40} color="white" />
                            <Text style={styles.text}>Take Picture</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                // Image preview is shown if an image is taken
                <Image source={{ uri: image }} style={styles.imagePreview} />
            )}

            <View style={styles.actionButtons}>
                {image ? (
                    <>
                        <TouchableOpacity style={styles.button} onPress={retakePicture}>
                            <Ionicons name="reload" size={24} color="black" />
                            <Text>Re-take</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={savePicture}>
                            <Ionicons name="checkmark-circle" size={24} color="black" />
                            <Text>Save</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <Ionicons name="camera" size={24} color="black" />
                        <Text>Take Picture</Text>
                    </TouchableOpacity>
                )}
            </View>
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
        width: 300,
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
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
});

export default UploadCrop;
