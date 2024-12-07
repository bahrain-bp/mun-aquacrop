// app/screens/Recommendation.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const Recommendation: React.FC = () => {
    const {
        title,
        imageSource,
        latitude,
        longitude,
        locationMethod,
        selectionMethod,
        selectedDate,
        growthStage,
        stageImage,
        kc,
        cropID,
        kcForCrop
        // @ts-ignore
    } = useLocalSearchParams<{
        title: string;
        imageSource: string;
        latitude: number;
        longitude: number;
        locationMethod: 'auto' | 'manual';
        selectionMethod: 'datePlanted' | 'growthStage';
        selectedDate?: string;
        growthStage?: string;
        stageImage?: string;
        kc: string;
        cropID: string;
        kcForCrop: number;
    }>();

    const [isLoading, setIsLoading] = useState(true);
    const [ET0, setET0] = useState<number | null>(null);
    const API_URL = process.env.EXPO_PUBLIC_PROD_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${API_URL}/calculate/water`, {
                    lat:latitude,
                    lon:longitude,
                });
                // Extract ET0 from the response
                var { ET0 } = response.data;
                ET0 = ET0 * kcForCrop;
                setET0(ET0);
            } catch (error) {
                console.error('Error fetching ET0:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [API_URL, latitude, longitude]);



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recommendation for {title}</Text>
            {imageSource && <Image source={{ uri: imageSource }} style={styles.image} />}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00aaff" />
                    <Text style={styles.loadingText}>Calculating water need...</Text>
                </View>
            ) : (
                <>
                    {ET0 !== null && (
                        <View style={styles.resultBox}>
                            <Text style={styles.resultText}>
                                Total Water Needed: <Text style={styles.emphasis}>{ET0.toFixed(2)} Liters</Text>
                            </Text>
                        </View>
                    )}

                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>kcForCrop : {kcForCrop}</Text>
                        <Text style={styles.infoText}>Crop ID: {cropID}</Text>
                        <Text style={styles.infoText}>Kc Value: {kc}</Text>
                        <Text style={styles.infoText}>Location Method: {locationMethod}</Text>
                        <Text style={styles.infoText}>Latitude: {latitude}</Text>
                        <Text style={styles.infoText}>Longitude: {longitude}</Text>
                        <Text style={styles.infoText}>Selection Method: {selectionMethod}</Text>
                        {selectionMethod === 'datePlanted' && (
                            <Text style={styles.infoText}>Date Planted: {selectedDate}</Text>
                        )}
                        {selectionMethod === 'growthStage' && (
                            <>
                                <Text style={styles.infoText}>Growth Stage: {growthStage}</Text>
                                {stageImage && (
                                    <Image source={{ uri: stageImage }} style={styles.stageImage} />
                                )}
                            </>
                        )}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 20,
        color: '#003366',
        textShadowColor: '#ccc',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    image: {
        width: 180,
        height: 180,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#ccc',
    },
    loadingContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
    resultBox: {
        marginVertical: 20,
        backgroundColor: '#e6f7ff',
        padding: 20,
        borderRadius: 15,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#b3ecff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
    },
    resultText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#005580',
        textAlign: 'center',
    },
    emphasis: {
        fontWeight: '700',
        color: '#007acc',
    },
    infoContainer: {
        marginTop: 20,
        width: '100%',
    },
    infoText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginVertical: 2,
    },
    stageImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
});

export default Recommendation;
