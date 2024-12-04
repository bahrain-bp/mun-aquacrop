import React, { useState, useEffect } from 'react';
import {Text, View, StyleSheet, ScrollView, Image, TouchableOpacity} from 'react-native';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

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

// Define a function to parse the raw data into a proper Crop type
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
    const [crops, setCrops] = useState<Crop[]>([]); // State to store fetched crops

    // Fetch the crops data when the component mounts
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await fetch(API_URL + '/crops');
                const data = await response.json();
                setCrops(parseCrops(data)); // Update state with fetched crops data
            } catch (error) {
                console.error("Error fetching crops:", error);
            }
        };

        fetchCrops();
    }, []); // Empty dependency array ensures it runs only once after initial render


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.text}>Home screen</Text>

            <View style={styles.grid}>
                {/* Dynamically generate rows of cards from the crops data */}
                {crops.length > 0 ? (
                    <View style={styles.row}>
                        {crops.map((crop, index) => (
                            <Card
                                key={index} // Add a unique key for each card
                                CropData={crop} // Passing the full crop data
                            />
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
    CropData: Crop; // Full crop data passed from the parent component
}

const Card: React.FC<CardProps> = ({ CropData }) => {
    const { nameEN, nameAR, GrowthStage, kc, CropID, ImageURL } = CropData;

    const router = useRouter();

    console.log(nameEN);
    const handlePress = () => {

        // Navigate to the Crop screen with parameters
        router.push({
            pathname: '/screens/Crop',
            params: {
                nameEN: nameEN.S,
                nameAR: nameAR.S,
                GrowthStage: JSON.stringify(GrowthStage), // Stringify if necessary
                kc: JSON.stringify(kc), // Stringify if necessary
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
        flex: 1,
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly', // Even space between items
        flexWrap: 'wrap', // Allow wrapping of cards to the next row
        width: '100%',
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
        justifyContent: 'center', // Centers content vertically within the card
        width: '30%', // This ensures each card takes up approximately 30% of the width (3 cards per row)
        marginBottom: 20,
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
    cardLink: {
        width: '100%',
        textAlign: 'center',
    },
});

export default Index;
