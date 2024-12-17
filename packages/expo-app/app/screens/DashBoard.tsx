import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions, Button } from 'react-native';
import { useRouter } from 'expo-router';
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

const Index: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const { width } = useWindowDimensions(); // Get the current window width

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await fetch(API_URL + '/crops');
                const data = await response.json();
                setCrops(parseCrops(data));
            } catch (error) {
                console.error("Error fetching crops:", error);
            }
        };

        fetchCrops();
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.text}>{i18n.t('home')}</Text>
            <View style={styles.grid}>
                {crops.length > 0 ? (
                    <View style={styles.row}>
                        {crops.map((crop, index) => (
                            <Card key={index} CropData={crop} />
                        ))}
                    </View>
                ) : (
                    <Text style={styles.text}>{i18n.t('loading')}</Text>
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
});

export default Index;
