import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import AWS from 'aws-sdk';
import i18n from '../i18n'; // Import the shared i18n instance
import { MaterialIcons } from '@expo/vector-icons';
import SettingsPopup from '../components/SettingsPopup';
import { useTheme, themes } from '../components/ThemeContext';

const API_URL = process.env.EXPO_PUBLIC_PROD_API_URL;

interface GrowthStage {
    ini: { N: string };
    mid: { N: string };
    end: { N: string };
}

interface Kc {
    ini: { N: string };
    mid: { N: string };
    end: { N: string };
}

interface Crop {
    nameEN: { S: string };
    nameAR: { S: string };
    GrowthStage: { M: GrowthStage };
    kc: { M: Kc };
    CropID: { S: string };
    ImageURL: { S: string };
}

const parseCrops = (data: any): Crop[] => {
    return data.map((item: any): Crop => ({
        nameEN: item.nameEN,
        nameAR: item.nameAR,
        GrowthStage: item.GrowthStage,
        kc: item.kc,
        CropID: item.CropID,
        ImageURL: item.ImageURL
    }));
};

// Configure AWS
AWS.config.update({
    region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
});

const Index: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [userName, setUserName] = useState<string>('Guest');
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get both tokens
                const idToken = await storage.getItem('idToken');
                const accessToken = await storage.getItem('accessToken');

                if (!idToken || !accessToken) {
                    throw new Error('No tokens found');
                }

                const response = await fetch(API_URL + '/crops', {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'X-Access-Token': accessToken
                    },
                });

                if (!response.ok) {
                    throw new Error('API request failed');
                }

                const data = await response.json();
                setCrops(parseCrops(data));

                // Fetch user data with access token
                if (accessToken) {
                    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
                    const userData = await cognitoidentityserviceprovider.getUser({
                        AccessToken: accessToken
                    }).promise();
                    const name = userData.UserAttributes.find(attr => attr.Name === 'name')?.Value;
                    if (name) {
                        setUserName(name);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                // Redirect to login if unauthorized
                router.replace('/');
            }
        };

        fetchData();
    }, []);

    const handleSettings = () => {
        setIsSettingsVisible(true);
    };

    return (
        <>
            <ScrollView 
                style={[styles.container, { backgroundColor: theme.background }]} 
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={[styles.welcomeContainer, { 
                        backgroundColor: theme.card,
                        shadowColor: isDarkMode ? '#000' : '#666'
                    }]}>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={[styles.greetingText, { color: theme.subText }]}>Welcome</Text>
                                <Text style={[styles.welcomeText, { color: theme.text }]}>{userName} 👋</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={handleSettings} 
                                style={[styles.settingsButton, { backgroundColor: theme.border }]}
                            >
                                <MaterialIcons name="settings" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('home')}</Text>
                    
                    <View style={styles.cropSection}>
                        <UploadImageCard />
                        {crops.length > 0 ? (
                            <View style={styles.cropGrid}>
                                {crops.map((crop, index) => (
                                    <Card key={index} CropData={crop} />
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.loadingText, { color: theme.subText }]}>{i18n.t('loading')}</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
            <SettingsPopup 
                visible={isSettingsVisible} 
                onClose={() => setIsSettingsVisible(false)} 
            />
        </>
    );
};

interface CardProps {
    CropData: Crop;
}

const Card: React.FC<CardProps> = ({ CropData }) => {
    const { nameEN, nameAR, GrowthStage, kc, CropID, ImageURL } = CropData;
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;

    const handlePress = () => {
        router.push({
            pathname: '/screens/Crop',
            params: {
                nameEN: nameEN.S,
                nameAR: nameAR.S,
                GrowthStage: JSON.stringify(GrowthStage),
                kc: JSON.stringify(kc),
                CropID: CropID.S,
                ImageURL: ImageURL.S,
            },
        });
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.cardWrapper}>
            <View style={[styles.cardContainer, { 
                backgroundColor: theme.card, 
                borderColor: theme.border,
                shadowColor: theme.shadow
            }]}>
                <Image 
                    source={{ uri: ImageURL.S }} 
                    style={[styles.image, { backgroundColor: theme.border }]}
                    resizeMode="cover"
                />
                <Text style={[styles.cardTitle, { color: theme.text }]}>{nameEN.S}</Text>
            </View>
        </TouchableOpacity>
    );
};

const UploadImageCard: React.FC = () => {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;

    return (
        <TouchableOpacity 
            style={[styles.uploadCard, { 
                backgroundColor: theme.card, 
                borderColor: theme.border,
                shadowColor: theme.shadow
            }]}
            onPress={() => router.push({ pathname: '/screens/CropImage' })}
        >
            <View style={styles.uploadContent}>
                <View>
                    <Text style={[styles.uploadTitle, { color: theme.text }]}>Upload Image</Text>
                    <Text style={[styles.uploadSubtitle, { color: theme.subText }]}>
                        Analyze your crop images
                    </Text>
                </View>
                <View style={[styles.uploadIconContainer, { backgroundColor: theme.border }]}>
                    <Text style={styles.uploadIcon}>📸</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    mainContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    welcomeContainer: {
        padding: 20,
        borderRadius: 15,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    greetingText: {
        fontSize: 16,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
    cropGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    cardWrapper: {
        width: '48%',
        marginBottom: 12,
    },
    cardContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        height: 180, // Increased height for better proportion
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 140, // Increased height for better image display
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        padding: 10,
    },
    uploadCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    uploadContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    uploadTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    uploadSubtitle: {
        fontSize: 14,
    },
    uploadIconContainer: {
        padding: 12,
        borderRadius: 12,
    },
    uploadIcon: {
        fontSize: 24,
    },
    cropSection: {
        gap: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
    },
    settingsButton: {
        padding: 8,
        borderRadius: 20,
        alignSelf: 'center',
    },
});

export default Index;
