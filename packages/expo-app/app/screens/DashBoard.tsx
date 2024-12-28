import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import AWS from 'aws-sdk';
import i18n from '../i18n'; // Import the shared i18n instance

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

    const handleSignOut = async () => {
        try {
            // Clear tokens from storage
            await storage.removeItem('idToken');
            await storage.removeItem('accessToken');
            // Navigate back to auth screen
            router.replace('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.greetingText}>Welcome</Text>
                    <Text style={styles.welcomeText}>{userName} 👋</Text>
                </View>
            </View>

            <View style={styles.mainContent}>
                <Text style={styles.sectionTitle}>{i18n.t('home')}</Text>
                
                <View style={styles.cropSection}>
                    <UploadImageCard />
                    {crops.length > 0 ? (
                        <View style={styles.cropGrid}>
                            {crops.map((crop, index) => (
                                <Card key={index} CropData={crop} />
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.loadingText}>{i18n.t('loading')}</Text>
                    )}
                </View>

                <View style={styles.signOutContainer}>
                    <TouchableOpacity 
                        style={styles.signOutButton}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.signOutButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

interface CardProps {
    CropData: Crop;
}

const Card: React.FC<CardProps> = ({ CropData }) => {
    const { nameEN, nameAR, GrowthStage, kc, CropID, ImageURL } = CropData;
    const router = useRouter();

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
            <View style={styles.cardContainer}>
                <Image 
                    source={{ uri: ImageURL.S }} 
                    style={styles.image}
                    resizeMode="cover"
                />
                <Text style={styles.cardTitle}>{nameEN.S}</Text>
            </View>
        </TouchableOpacity>
    );
};

const UploadImageCard: React.FC = () => {
    const router = useRouter();

    return (
        <TouchableOpacity 
            style={styles.uploadCard} 
            onPress={() => router.push({ pathname: '/screens/CropImage' })}
        >
            <View style={styles.uploadContent}>
                <View>
                    <Text style={styles.uploadTitle}>Upload Image</Text>
                    <Text style={styles.uploadSubtitle}>Analyze your crop images</Text>
                </View>
                <View style={styles.uploadIconContainer}>
                    <Text style={styles.uploadIcon}>📸</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#202124', // Slightly lighter dark background
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
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    welcomeContainer: {
        padding: 20,
        backgroundColor: '#2D2F31', // Lighter card background
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    greetingText: {
        color: '#B4B8C0', // Brighter secondary text
        fontSize: 16,
        marginBottom: 8,
    },
    welcomeText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    loadingText: {
        color: '#9DA3B4',
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
        backgroundColor: '#2D2F31', // Lighter card background
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#404144', // Lighter border
        height: 180, // Increased height for better proportion
    },
    image: {
        width: '100%',
        height: 140, // Increased height for better image display
        backgroundColor: '#353839',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: 10,
    },
    uploadCard: {
        backgroundColor: '#2D2F31', // Lighter card background
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#404144', // Lighter border
        padding: 16,
        marginBottom: 16,
    },
    uploadContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    uploadTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    uploadSubtitle: {
        color: '#B4B8C0', // Brighter secondary text
        fontSize: 14,
    },
    uploadIconContainer: {
        backgroundColor: '#404144', // Lighter icon background
        padding: 12,
        borderRadius: 12,
    },
    uploadIcon: {
        fontSize: 24,
    },
    signOutContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    signOutButton: {
        backgroundColor: '#2D2F31', // Lighter button background
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF4B4B',
        minWidth: 140,
    },
    signOutButtonText: {
        color: '#FF4B4B',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    cropSection: {
        gap: 16,
    },
});

export default Index;
