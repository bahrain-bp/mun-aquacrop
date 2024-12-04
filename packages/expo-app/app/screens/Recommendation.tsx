// app/screens/Recommendation.tsx

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

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
        cropID
        // @ts-ignore
    } = useLocalSearchParams<{
        title: string,
        imageSource: string,
        latitude: number,
        longitude: number,
        locationMethod: 'auto' | 'manual',
        selectionMethod: 'datePlanted' | 'growthStage',
        selectedDate?: string,
        growthStage?: string,
        stageImage?: string,
        kc: string,
        cropID: string
    }>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recommendation for {title}</Text>
            <Image source={{ uri: imageSource }} style={styles.image} />

            <Text>Crop ID: {cropID}</Text>
            <Text>Kc Value: {kc}</Text>

            <Text>Location Method: {locationMethod}</Text>
            <Text>Latitude: {latitude}</Text>
            <Text>Longitude: {longitude}</Text>

            <Text>Selection Method: {selectionMethod}</Text>
            {selectionMethod === 'datePlanted' && (
                <Text>Date Planted: {selectedDate}</Text>
            )}
            {selectionMethod === 'growthStage' && (
                <>
                    <Text>Growth Stage: {growthStage}</Text>
                    {stageImage && <Image source={{ uri: stageImage }} style={styles.stageImage} />}
                </>
            )}

            {/* Add more recommendation details as needed */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 15,
        marginBottom: 20,
    },
    stageImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginTop: 10,
    },
});

export default Recommendation;
