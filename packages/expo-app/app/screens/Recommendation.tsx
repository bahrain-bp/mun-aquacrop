// app/screens/Recommendation.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import i18n from '../i18n';
import { storage } from "@/app/utils/storage";
import { useTheme, themes } from '../components/ThemeContext';

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
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;

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

                // Update stats with water usages
                try {
                    await axios.post(
                        `${API_URL}/adminDashboard/stats/updateWaterUsage`,  
                        { waterAmount: Number(ET0.toFixed(2)) },
                        {
                            headers: {
                                'Authorization': `Bearer ${idToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    console.log('Water usage updated successfully:', Number(ET0.toFixed(2)));
                } catch (statsError) {
                    console.error('Error updating water usage:', statsError);
                }
            } catch (error) {
                console.error('Error fetching ET0:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [API_URL, latitude, longitude]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow 
            }]}>
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.title, { color: theme.text }]}>{growthStage} growth stage</Text>
                {imageSource && (
                    <Image source={{ uri: imageSource }} style={styles.image} />
                )}
            </View>

            <View style={styles.mainContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.accent} />
                        <Text style={[styles.loadingText, { color: theme.text }]}>
                            {i18n.t('calcwaterneed')}
                        </Text>
                    </View>
                ) : (
                    <>
                        {ET0 !== null && (
                            <View style={[styles.resultBox, { 
                                backgroundColor: theme.card,
                                borderColor: theme.border 
                            }]}>
                                <Text style={[styles.resultLabel, { color: theme.subText }]}>
                                    {i18n.t('totwaterneed')}
                                </Text>
                                <Text style={[styles.resultValue, { color: theme.accent }]}>
                                    {ET0.toFixed(2)} Liters
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity 
                            style={[styles.returnButton, { 
                                backgroundColor: theme.card,
                                borderColor: theme.accent 
                            }]}
                            onPress={() => router.replace('/screens/DashBoard')}
                        >
                            <Text style={[styles.returnButtonText, { color: theme.accent }]}>
                                ← Return to Dashboard
                            </Text>
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
    },
    header: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        margin: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
    },
    mainContent: {
        padding: 16,
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
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
        fontWeight: '500',
    },
    resultBox: {
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        alignItems: 'center',
        marginTop: 16,
    },
    resultLabel: {
        fontSize: 18,
        marginBottom: 12,
        textAlign: 'center',
    },
    resultValue: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    returnButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    returnButtonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default Recommendation;
