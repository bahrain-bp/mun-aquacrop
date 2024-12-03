import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

const Crop: React.FC = () => {
    const router = useRouter();
    const { nameEN, nameAR, GrowthStage, kc, CropID, ImageURL } = router.params;  // Corrected to use router.params

    const [selectedOption, setSelectedOption] = useState("datePlanted");
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [growthStage, setGrowthStage] = useState("");

    // Handle stage selection
    const handleStageSelection = (stage: string) => {
        setGrowthStage(stage);
    };

    // Navigate to Recommendation screen
    const navigateToRecommendation = () => {
        router.push({
            pathname: '/screens/Recommendation',
            params: {
                title: nameEN,  // Dynamically set title from params
                imageSource: ImageURL,  // Pass the imageSource here
            },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{nameEN}</Text>
            <Image source={{ uri: ImageURL }} style={styles.image} />

            <View style={styles.radioButtonWrapper}>
                <RadioButton
                    value="datePlanted"
                    status={selectedOption === 'datePlanted' ? 'checked' : 'unchecked'}
                    onPress={() => setSelectedOption('datePlanted')}
                />
                <Text style={styles.radioLabel}>Date Planted</Text>

                <RadioButton
                    value="growthStage"
                    status={selectedOption === 'growthStage' ? 'checked' : 'unchecked'}
                    onPress={() => setSelectedOption('growthStage')}
                />
                <Text style={styles.radioLabel}>Growth Stage</Text>
            </View>

            {selectedOption === 'datePlanted' && (
                <View style={styles.datePlantedContainer}>
                    <TextInput style={styles.dateInput} placeholder="DD" value={day} onChangeText={setDay} />
                    <TextInput style={styles.dateInput} placeholder="MM" value={month} onChangeText={setMonth} />
                    <TextInput style={styles.dateInput} placeholder="YYYY" value={year} onChangeText={setYear} />
                </View>
            )}

            {selectedOption === 'growthStage' && (
                <View style={styles.growthStageContainer}>
                    <Text>Select Growth Stage:</Text>
                    <View style={styles.stageButtonsContainer}>
                        {['Stage 1', 'Stage 2', 'Stage 3'].map((stage) => (
                            <TouchableOpacity key={stage} onPress={() => handleStageSelection(stage)}>
                                <Text>{stage}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <TouchableOpacity style={styles.calculateButton} onPress={navigateToRecommendation}>
                <Text style={styles.calculateButtonText}>Calculate Water Need</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginTop: 20,
    },
    radioButtonWrapper: {
        flexDirection: 'row',
        marginTop: 30,
        alignItems: 'center',
    },
    radioLabel: {
        fontSize: 16,
        marginLeft: 10,
    },
    dateInput: {
        height: 40,
        width: '25%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 5,
    },
    calculateButton: {
        backgroundColor: 'black',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 5,
        marginTop: 40,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Crop;
