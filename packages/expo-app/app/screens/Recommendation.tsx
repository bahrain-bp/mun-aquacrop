import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Recommendation: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Water Recommendation</Text>
                <Text style={styles.cardContent}>
                   testing
                </Text>
                <Text style={styles.cardContent}>15 liters per day</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    card: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cardContent: {
        fontSize: 16,
        marginBottom: 10,
    },
});

export default Recommendation;
