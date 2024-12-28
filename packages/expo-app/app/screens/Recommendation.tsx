// app/screens/Recommendation.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import i18n from '../i18n';
import {storage} from "@/app/utils/storage"; // Import the shared i18n instance

const Recommendation: React.FC = () => {
    const router = useRouter();
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
                var idToken =  await storage.getItem('idToken');

                const response = await axios.post(`${API_URL}/calculate/water`, {
                    lat: latitude,
                    lon: longitude,
                }, {
                    headers: { Authorization: `Bearer ${idToken}` },
                });
                // Extract ET0 from the response
                var { ET0 } = response.data;
                 ET0 = ET0 * kcForCrop;
                 ET0 =1.05 * 0.25 * ET0;
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
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {imageSource && (
                    <Image source={{ uri: imageSource }} style={styles.image} />
                )}
            </View>

            <View style={styles.mainContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>{i18n.t('calcwaterneed')}</Text>
                    </View>
                ) : (
                    <>
                        {ET0 !== null && (
                            <View style={styles.resultBox}>
                                <Text style={styles.resultLabel}>{i18n.t('totwaterneed')}</Text>
                                <Text style={styles.resultValue}>{ET0.toFixed(2)} Liters</Text>
                            </View>
                        )}
                        <TouchableOpacity 
                            style={styles.returnButton}
                            onPress={() => router.replace('/screens/DashBoard')}
                        >
                            <Text style={styles.returnButtonText}>← Return to Dashboard</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202124',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#2D2F31',
        borderRadius: 15,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mainContent: {
        padding: 16,
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    resultBox: {
        backgroundColor: '#2D2F31',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: '#404144',
        alignItems: 'center',
        marginTop: 16,
    },
    resultLabel: {
        fontSize: 18,
        color: '#B4B8C0',
        marginBottom: 12,
        textAlign: 'center',
    },
    resultValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
        textAlign: 'center',
    },
    returnButton: {
        backgroundColor: '#2D2F31',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#4CAF50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    returnButtonText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default Recommendation;
