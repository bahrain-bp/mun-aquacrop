// app/screens/Crop.tsx

import React, {useState, useEffect} from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import {useRouter} from "expo-router";
import {useLocalSearchParams} from 'expo-router';
import * as Location from 'expo-location';
import {Picker} from '@react-native-picker/picker'; // Native Picker (not used after switch to SelectList)
import DateTimePicker from '@react-native-community/datetimepicker'; // For iOS/Android
import DatePicker from 'react-datepicker'; // For Web
import 'react-datepicker/dist/react-datepicker.css'; // Required CSS for react-datepicker on Web
import CustomRadioButton from '@/components/CustomRadioButton'; // Ensure the path is correct

// Testing
import {SelectList} from 'react-native-dropdown-select-list'

// Testing end

interface LocationOption {
    label: string;
    value: string;
    latitude: number;
    longitude: number;
}

interface GrowthStageOption {
    label: string;
    value: string;
    imageSource: string;
}

const Crop: React.FC = () => {
    const router = useRouter();
    const {nameEN, GrowthStage, kc, CropID, ImageURL} = useLocalSearchParams<{
        nameEN: string;
        GrowthStage: string;
        kc: string;
        CropID: string;
        ImageURL: string;
    }>();

    console.log('Received Params:', {nameEN, GrowthStage, kc, CropID, ImageURL});

    // State Variables
    const [selectedOption, setSelectedOption] = useState<"datePlanted" | "growthStage">("datePlanted");
    const [growthStage, setGrowthStage] = useState<string>("");
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [locationSelected, setLocationSelected] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationMethod, setLocationMethod] = useState<'auto' | 'manual'>('auto'); // Toggle location method
    const [selectedLocationValue, setSelectedLocationValue] = useState<string>(""); // Initialize to empty string
    const [isAutoDisabled, setIsAutoDisabled] = useState<boolean>(false); // To disable 'auto' if location fetching fails

    const bahrainLocations: LocationOption[] = [
        {label: "Manama", value: "manama", latitude: 26.2041, longitude: 50.5860},
        {label: "Riffa", value: "riffa", latitude: 26.1500, longitude: 50.5556},
        {label: "Muharraq", value: "muharraq", latitude: 26.2521, longitude: 50.6233},
        {label: "Sitra", value: "sitra", latitude: 26.0890, longitude: 50.6135},
        {label: "Isa Town", value: "isa_town", latitude: 26.2069, longitude: 50.5278},
        // Add more locations as needed...
    ];

    const growthStages: GrowthStageOption[] = [
        {
            label: "Stage 1",
            value: "stage1",
            imageSource: "https://www.saferbrand.com/media/wysiwyg/Articles/Safer-Brand/sb-article-plant-growth-stage-1.png"
        },
        {
            label: "Stage 2",
            value: "stage2",
            imageSource: "https://www.saferbrand.com/media/wysiwyg/Articles/Safer-Brand/sb-article-plant-growth-stage-2.png"
        },
        {
            label: "Stage 3",
            value: "stage3",
            imageSource: "https://www.saferbrand.com/media/wysiwyg/Articles/Safer-Brand/sb-article-plant-growth-stage-3.png"
        },
    ];

    const locationDataForSelect = bahrainLocations.map(loc => ({
        key: loc.value,
        value: loc.label
    }));

    useEffect(() => {
        if (locationMethod === 'auto') {
            requestLocation();
        } else {
            // Clear automatic location if switching to manual
            setLocation(null);
            setErrorMsg(null);
        }
    }, [locationMethod]);

    const requestLocation = async () => {
        try {
            if (Platform.OS === 'web') {
                // For Web, use the browser's geolocation API
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const {latitude, longitude} = position.coords;
                            console.log('Fetched Location:', latitude, longitude);
                            setLocation({latitude, longitude});
                            setErrorMsg(null);
                        },
                        (error) => {
                            setErrorMsg('Error fetching location: ' + error.message);
                            Alert.alert('Location Error', error.message);
                            // Disable 'auto' and switch to 'manual'
                            setIsAutoDisabled(true);
                            setLocationMethod('manual');
                        }
                    );
                } else {
                    setErrorMsg('Geolocation is not supported by this browser.');
                    Alert.alert('Location Error', 'Geolocation is not supported by this browser.');
                    // Disable 'auto' and switch to 'manual'
                    setIsAutoDisabled(true);
                    setLocationMethod('manual');
                }
            } else {
                // For iOS/Android, use expo-location
                let {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    Alert.alert('Permission Denied', 'Permission to access location was denied');
                    // Disable 'auto' and switch to 'manual'
                    setIsAutoDisabled(true);
                    setLocationMethod('manual');
                    return;
                }

                let loc = await Location.getCurrentPositionAsync({});
                console.log('Fetched Location:', loc.coords.latitude, loc.coords.longitude);
                setLocation(loc.coords);
                setErrorMsg(null);
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            setErrorMsg('Failed to fetch location');
            Alert.alert('Location Error', 'Failed to fetch location');
            // Disable 'auto' and switch to 'manual'
            setIsAutoDisabled(true);
            setLocationMethod('manual');
        }
    };

    const handleLocationSelect = (selectedLocation: string) => {
        console.log('Selected Location Value:', selectedLocation);
        setSelectedLocationValue(selectedLocation);
        const selected = bahrainLocations.find(loc => loc.value === selectedLocation);
        if (selected) {
            console.log('Selected Coordinates:', selected.latitude, selected.longitude);
            setLocationSelected({latitude: selected.latitude, longitude: selected.longitude});
            setErrorMsg(null);
        } else {
            // If the user selects the placeholder, clear the locationSelected
            setLocationSelected(null);
        }
    };

    // Handle stage selection
    const handleStageSelection = (stage: string) => {
        console.log('Selected Growth Stage:', stage);
        setGrowthStage(stage);
    };

    // Navigate to Recommendation screen
    const navigateToRecommendation = () => {
        debugger;
        let finalLocation: { latitude: number; longitude: number } | null = null;
        let locationMethodUsed: 'auto' | 'manual' = locationMethod;
        let imageLink: string | null = null; // To hold the image link

        if (locationMethod === 'auto') {
            finalLocation = location;
        } else if (locationMethod === 'manual') {
            finalLocation = locationSelected;
        }

        if (!finalLocation) {
            Alert.alert('Location Missing', 'Please select a valid location.');
            return;
        }

        // Ensure that either a date or a growth stage is selected
        if (selectedOption === 'datePlanted' && !isDateSelected) {
            Alert.alert('Date Missing', 'Please select a planting date.');
            return;
        }

        if (selectedOption === 'growthStage' && !isGrowthStageSelected) {
            Alert.alert('Growth Stage Missing', 'Please select a growth stage.');
            return;
        }

        // Get the image link based on the selected option
        if (selectedOption === 'growthStage') {
            const selectedStage = growthStages.find(stage => stage.value === growthStage);
            if (selectedStage) {
                imageLink = selectedStage.imageSource;
            }
        }

        let kcForCrop;


        if (selectedOption == 'datePlanted') {
            selectedDate?.toISOString()
        } else if (selectedOption == 'growthStage'){

            if (growthStage == 'stage1') {
                kcForCrop = GrowthStage;
            } else if (growthStage == 'stage2') {
                kcForCrop = GrowthStage?.M?.mid?.N;
            } else if (growthStage == 'stage3') {
                kcForCrop = GrowthStage?.M?.end?.N;
            }
            console.log('kcForCrop:', kcForCrop);
            console.log('kcForCrops at mt endoint');
        }

        let recommendationParams: any = {
            // Data from the previous page
            title: nameEN,
            imageSource: ImageURL,
            kcForCrop: kcForCrop,
            // New data from this page
            latitude: finalLocation.latitude,
            longitude: finalLocation.longitude,
            locationMethod: locationMethodUsed, // 'auto' or 'manual'
            // Selection method: 'datePlanted' or 'growthStage'
            selectionMethod: selectedOption,
            ...(selectedOption === 'datePlanted' && {selectedDate: selectedDate?.toISOString()}),
            ...(selectedOption === 'growthStage' && {growthStage: growthStage, stageImage: imageLink}),
            kc: kc,
            cropID: CropID,
        };

        console.log('Recommendation Params:', recommendationParams);

        // Navigate to Recommendation screen with all parameters
        router.push({
            pathname: '/screens/Recommendation',
            params: recommendationParams,
        });
    };

    const onDateChange = (event: any, chosenDate: Date | undefined) => {
        const currentDate = chosenDate || selectedDate;
        setSelectedDate(currentDate);
        console.log('Selected Date:', currentDate);
    };

    // Determine if the button should be enabled
    const isDateSelected = selectedDate && !isNaN(selectedDate.getTime());
    const isGrowthStageSelected = growthStage !== "";
    let isLocationAvailable = false;
    if (locationMethod === 'auto') {
        isLocationAvailable = location !== null;
    } else if (locationMethod === 'manual') {
        isLocationAvailable = locationSelected !== null;
    }

    const isButtonEnabled = (selectedOption === 'datePlanted' && isDateSelected) ||
        (selectedOption === 'growthStage' && isGrowthStageSelected);

    // testing
    const [selected, setSelected] = React.useState("");


    // testing end

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{nameEN}</Text>
            {ImageURL ? (
                <Image source={{uri: ImageURL}} style={styles.image}/>
            ) : (
                <View style={styles.placeholderImage}>
                    <Text>No Image Available</Text>
                </View>
            )}

            {/* Radio buttons to choose location method */}
            <View style={styles.locationMethodWrapper}>

                <View style={styles.locationMethodWrapperText}>
                    <Text style={styles.locationMethodTitle}>Choose Location Method</Text>
                </View>

                <View style={styles.radioButtonsRow}>
                    <View style={styles.radioButtons}>
                        <CustomRadioButton
                            label="By Location"
                            selected={locationMethod === 'auto'}
                            onPress={() => setLocationMethod('auto')}
                            disabled={isAutoDisabled}
                        />
                    </View>
                    <View style={styles.radioButtons}>
                        <CustomRadioButton
                            label="By Dropdown"
                            selected={locationMethod === 'manual'}
                            onPress={() => setLocationMethod('manual')}
                        />
                    </View>
                </View>
            </View>

            {/* Dropdown for manual location selection */}
            {locationMethod === 'manual' && (
                <View style={styles.pickerContainer}>
                    <SelectList
                        data={locationDataForSelect}
                        setSelected={(val) => {
                            setSelected(val);
                            handleLocationSelect(val);
                        }}
                        placeholder="Select your location in Bahrain"
                    />
                </View>
            )}

            {/* Radio buttons for Date Planted and Growth Stage */}
            <View style={styles.radioButtonWrapperDateGrowth}>
                <View style={styles.radioButtonsRow}>
                    <View style={styles.radioButtons}>
                        <CustomRadioButton
                            label="Date Planted"
                            selected={selectedOption === 'datePlanted'}
                            onPress={() => setSelectedOption('datePlanted')}
                        />
                    </View>

                    <View style={styles.radioButtons}>
                        <CustomRadioButton
                            label="Growth Stage"
                            selected={selectedOption === 'growthStage'}
                            onPress={() => setSelectedOption('growthStage')}
                        />
                    </View>
                </View>
            </View>

            {/* Date Picker */}
            {selectedOption === 'datePlanted' && (
                <View style={styles.datePlantedContainer}>
                    {Platform.OS === 'web' ? (
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: Date) => setSelectedDate(date)}
                            dateFormat="yyyy-MM-dd"
                            className="date-picker"
                            placeholderText="Select a date"
                        />
                    ) : (
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                </View>
            )}

            {/* Growth Stage Selection */}
            {selectedOption === 'growthStage' && (
                <View style={styles.growthStageContainer}>
                    <Text style={styles.sectionTitle}>Select Growth Stage:</Text>
                    <ScrollView
                        horizontal={true}
                        contentContainerStyle={styles.growthStagesScroll}
                        showsHorizontalScrollIndicator={false}
                    >
                        {growthStages.map((stage) => (
                            <View
                                key={stage.value}
                                style={[
                                    styles.stageBox,
                                    growthStage === stage.value && styles.selectedStageBox
                                ]}
                            >
                                <Text style={styles.stageLabel}>{stage.label}</Text>
                                {stage.imageSource ? (
                                    <Image source={{uri: stage.imageSource}} style={styles.stageImage}/>
                                ) : (
                                    <View style={styles.placeholderStageImage}>
                                        <Text>No Image</Text>
                                    </View>
                                )}
                                <CustomRadioButton
                                    label=""
                                    selected={growthStage === stage.value}
                                    onPress={() => handleStageSelection(stage.value)}
                                />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Calculate Water Need Button */}
            <TouchableOpacity
                style={[
                    styles.calculateButton,
                    (!isButtonEnabled || !isLocationAvailable) ? styles.disabledButton : {}
                ]}
                onPress={navigateToRecommendation}
                disabled={!isButtonEnabled || !isLocationAvailable}
            >
                <Text style={styles.calculateButtonText}>Calculate Water Need</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f4f7',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
    image: {
        width: 220,
        height: 220,
        borderRadius: 15,
        marginTop: 20,
        marginBottom: 20,
    },
    placeholderImage: {
        width: 220,
        height: 220,
        borderRadius: 15,
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationMethodWrapper: {},
    locationMethodWrapperText: {
        alignItems: 'center',
    },
    locationMethodTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#555',
    },
    radioButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    radioButtons: {
        padding: 20,
        paddingBottom: 0,
        paddingTop: 0,
        margin: 10,
    },
    pickerContainer: {
        width: '35%',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    radioButtonWrapperDateGrowth: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePlantedContainer: {
        width: '80%',
        marginTop: 20,
        alignItems: 'center',
    },
    growthStageContainer: {
        width: '100%',
        marginTop: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#555',
        marginBottom: 10,
    },
    growthStagesScroll: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stageBox: {
        width: 120,
        alignItems: 'center',
        marginRight: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 2, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: {width: 0, height: 2}, // For iOS shadow
        shadowOpacity: 0.2, // For iOS shadow
        shadowRadius: 2, // For iOS shadow
    },
    selectedStageBox: {
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    stageLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    stageImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginBottom: 10,
    },
    placeholderStageImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calculateButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 5,
        marginTop: 40,
        width: '80%',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Crop;
