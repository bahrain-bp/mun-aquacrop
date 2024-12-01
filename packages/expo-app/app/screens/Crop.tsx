import React, { useState } from 'react';
import { Text, View, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper'; // Import RadioButton from react-native-paper

const Crop: React.FC = ({ navigation }) => {
    // Static title and image
    const title = "Default Crop Title";  // Set a default title or use static content
    const imageSource = require("../../assets/images/adaptive-icon.png");  // Set a default image

    // State to handle location input (even though it will be disabled)
    const [location, setLocation] = useState("Sample Location");

    // State for radio buttons (Date Planted, Growth Stage)
    const [selectedOption, setSelectedOption] = useState("datePlanted");  // Default to 'datePlanted'
    const [day, setDay] = useState("");  // State for day input
    const [month, setMonth] = useState("");  // State for month input
    const [year, setYear] = useState("");  // State for year input
    const [growthStage, setGrowthStage] = useState("");  // State for selected growth stage

    // Function to handle selecting a growth stage
    const handleStageSelection = (stage: string) => {
        setGrowthStage(stage);
    };

    // Navigate to the Recommendation page when button is pressed
    const handleCalculatePress = () => {
        navigation.navigate('Recommendation'); // This line navigates to the Recommendation page
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Image source={imageSource} style={styles.image} />

            {/* Disabled Input for location */}
            <TextInput
                style={styles.input}
                placeholder="Enter location"
                value={location}
                editable={false}  // Disable the input
            />

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

            {/* Conditional Rendering */}
            {selectedOption === 'datePlanted' && (
                <View style={styles.datePlantedContainer}>
                    <View style={styles.dateInputContainer}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="DD"
                            value={day}
                            onChangeText={setDay}  // Update day state
                            keyboardType="numeric"
                            maxLength={2} // Limit to 2 digits for day
                        />
                        <TextInput
                            style={styles.dateInput}
                            placeholder="MM"
                            value={month}
                            onChangeText={setMonth}  // Update month state
                            keyboardType="numeric"
                            maxLength={2} // Limit to 2 digits for month
                        />
                        <TextInput
                            style={styles.dateInput}
                            placeholder="YYYY"
                            value={year}
                            onChangeText={setYear}  // Update year state
                            keyboardType="numeric"
                            maxLength={4} // Limit to 4 digits for year
                        />
                    </View>
                    {(day && month && year) && <Text>Selected Date: {day}/{month}/{year}</Text>}
                </View>
            )}

            {selectedOption === 'growthStage' && (
                <View style={styles.growthStageContainer}>
                    <Text>Select Growth Stage:</Text>
                    <View style={styles.stageButtonsContainer}>
                        {['Stage 1', 'Stage 2', 'Stage 3'].map((stage) => (
                            <TouchableOpacity
                                key={stage}
                                style={[
                                    styles.stageButton,
                                    growthStage === stage && styles.selectedStageButton,
                                ]}
                                onPress={() => handleStageSelection(stage)}
                            >
                                <Text style={styles.stageButtonText}>{stage}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {growthStage && <Text>Selected Growth Stage: {growthStage}</Text>}
                </View>
            )}

            {/* Calculate Button at the bottom */}
            <TouchableOpacity style={styles.calculateButton} onPress={handleCalculatePress}>
                <Text style={styles.calculateButtonText}>Calculate Wanted Need</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start', // Adjust to allow space at the bottom
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginTop: 20,
    },
    input: {
        height: 30,  // Smaller height for the input field
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginTop: 20,
        width: '30%',  // Adjusted width to make it more appropriate
        fontSize: 12,  // Smaller text size
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
        height: 30,
        width: '25%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        fontSize: 14,
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

    // Styles for the Calculate Button
    calculateButton: {
        position: 'absolute',  // Positioning at the bottom of the screen
        bottom: 30,  // 30 units from the bottom edge
        backgroundColor: 'black',  // Black background
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 5,
    },
    calculateButtonText: {
        color: '#fff',  // White text
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Crop;
