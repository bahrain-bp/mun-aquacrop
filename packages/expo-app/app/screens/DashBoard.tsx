import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import AWS from 'aws-sdk';

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL + '/crops');
                const data = await response.json();
                setCrops(parseCrops(data));

                const accessToken = await storage.getItem('accessToken');
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
            }
        };

        fetchData();
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.welcomeContainer}>
                <Text style={styles.greetingText}>Welcome</Text>
                <Text style={styles.welcomeText}>{userName} 👋</Text>
                
            </View>
            <Text style={styles.text}>Home screen</Text>
            <View style={styles.grid}>
                {crops.length > 0 ? (
                    <View style={styles.row}>
                        {crops.map((crop, index) => (
                            <Card key={index} CropData={crop} />
                        ))}
                    </View>
                ) : (
                    <Text style={styles.text}>Loading crops...</Text>
                )}
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
        <TouchableOpacity onPress={handlePress} style={styles.cardLink}>
            <View style={styles.cardContainer}>
                <Image source={{ uri: ImageURL.S }} style={styles.image} />
                <Text style={styles.cardTitle}>{nameEN.S}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#25292e',
        padding: 20,
    },
    contentContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    text: {
        color: '#fff',
        fontSize: 24,
        marginBottom: 20,
    },
    grid: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',  // Align the cards horizontally
        flexWrap: 'wrap',      // Allow cards to wrap to the next row
        justifyContent: 'space-between',  // Distribute cards evenly across rows
        width: '100%',  // Ensure the row takes the full width of the parent container
    },
    cardLink: {
        width: '48%',  // 2 cards per row with 2% margin for spacing
        marginBottom: 20,
    },
    cardContainer: {
        backgroundColor: '#D3D3D3',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',  // Ensure the card takes the full width of the parent container
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    cardTitle: {
        marginVertical: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    welcomeText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',  
    },
    welcomeContainer: {
        marginBottom: 30,
        alignItems: 'center',  
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
    greetingText: {
        color: '#9DA3B4',
        fontSize: 18,
        marginBottom: 5,
        textAlign: 'center', 
    },
    subText: {
        color: '#9DA3B4',
        fontSize: 16,
        textAlign: 'center', 
    },
});

export default Index;
