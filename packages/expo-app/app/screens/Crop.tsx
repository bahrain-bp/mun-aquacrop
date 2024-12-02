import React, { useState } from 'react';
import { Text, View, Image,Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Link } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router'; // Import useRoute to access params

const Crop: React.FC = () => {
    // Retrieve the parameters passed from the previous screen
    const route = useRouter();
    const { title, imageSource } = route.params;  // Destructure the passed parameters

    // State for radio buttons
    const [selectedOption, setSelectedOption] = useState("datePlanted");
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [growthStage, setGrowthStage] = useState("");

    // Function to handle stage selection
    const handleStageSelection = (stage: string) => {
        setGrowthStage(stage);
    };

    return (
        <View style={styles.container}>
            {/* Dynamically display crop title */}
            <Text style={styles.title}>{title}</Text>
            {/* Dynamically display crop image */}
            <Image source={{ uri: imageSource }} style={styles.image} />

            {/* Radio Buttons for Date Planted and Growth Stage */}
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

            {/* Conditional Rendering for Date Planted */}
            {selectedOption === 'datePlanted' && (
                <View style={styles.datePlantedContainer}>
                    <View style={styles.dateInputContainer}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="DD"
                            value={day}
                            onChangeText={setDay}
                            keyboardType="numeric"
                            maxLength={2}
                        />
                        <TextInput
                            style={styles.dateInput}
                            placeholder="MM"
                            value={month}
                            onChangeText={setMonth}
                            keyboardType="numeric"
                            maxLength={2}
                        />
                        <TextInput
                            style={styles.dateInput}
                            placeholder="YYYY"
                            value={year}
                            onChangeText={setYear}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    </View>
                    {(day && month && year) && <Text>Selected Date: {day}/{month}/{year}</Text>}
                </View>
            )}

            {/* Conditional Rendering for Growth Stage */}
            {selectedOption === 'growthStage' && (
                <View style={styles.growthStageContainer}>
                    <Text>Select Growth Stage:</Text>
                    <View style={styles.stageButtonsContainer}>
                        {['Stage 1', 'Stage 2', 'Stage 3'].map((stage) => (
                            <TouchableOpacity
                                key={stage}
                                style={[styles.stageButton, growthStage === stage && styles.selectedStageButton]}
                                onPress={() => handleStageSelection(stage)}
                            >
                                <Text style={styles.stageButtonText}>{stage}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {growthStage && <Text>Selected Growth Stage: {growthStage}</Text>}
                </View>
            )}

            {/* Calculate Button */}
            <View style={styles.bottomContainer}>
                <Link
                    href={{
                        pathname: '/screens/Recommendation',
                        params: { title: 'Broccoli', imageSource: require('../../assets/images/favicon.png') },
                    }}
                >
                    <TouchableOpacity style={styles.calculateButton}>
                        <Text style={styles.calculateButtonText}>Calculate Water Need</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
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
    datePlantedContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 10,
    },
    dateInput: {
        height: 40,
        width: '25%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        fontSize: 16,
        marginRight: 5,
    },
    growthStageContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    stageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    stageButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        margin: 5,
    },
    selectedStageButton: {
        backgroundColor: '#28a745',
    },
    stageButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    bottomContainer: {
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    calculateButton: {
        backgroundColor: 'black',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 5,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Crop;
