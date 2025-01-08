// app/screens/Crop.tsx
import React, {useState, useEffect} from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, } from 'react-native';
import {useRouter} from "expo-router";
import {useLocalSearchParams} from 'expo-router';
import * as Location from 'expo-location';
import {Picker} from '@react-native-picker/picker'; // Native Picker (not used after switch to SelectList)
import DateTimePicker from '@react-native-community/datetimepicker'; // For iOS/Android
import DatePicker from 'react-datepicker'; // For Web
import 'react-datepicker/dist/react-datepicker.css'; // Required CSS for react-datepicker on Web
import CustomRadioButton from '@/components/CustomRadioButton'; // Ensure the path is correct
import i18n from '../i18n'; // Import the shared i18n instance
import { useTheme, themes } from '../components/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const {nameEN, nameAR, GrowthStage, kc, CropID, ImageURL} = useLocalSearchParams<{
        nameEN: string;
        nameAR: string;
        GrowthStage: string;
        kc: string;
        CropID: string;
        ImageURL: string;
    }>();

    console.log('Received Params:', {nameEN, nameAR, GrowthStage, kc, CropID, ImageURL});

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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;
    const [language, setLanguage] = useState<string | null>(null); // to keep track of the language preference

    const bahrainLocations: LocationOption[] = [
        {label: i18n.t('l1'), value: "manama", latitude: 26.2041, longitude: 50.5860},
        {label: i18n.t('l2'), value: "riffa", latitude: 26.1500, longitude: 50.5556},
        {label: i18n.t('l3'), value: "muharraq", latitude: 26.2521, longitude: 50.6233},
        {label: i18n.t('l4'), value: "sitra", latitude: 26.0890, longitude: 50.6135},
        {label: i18n.t('l5'), value: "isa_town", latitude: 26.2069, longitude: 50.5278},
        // Add more locations as needed...
    ];

    //retrieve language selected
    useEffect(() => {
        const loadLanguage = async () => {
          try {
            const savedLanguage = await AsyncStorage.getItem('language');
            const activeLanguage = savedLanguage || 'en'; // Default to English if no preference exists
            setLanguage(activeLanguage);
            i18n.locale = activeLanguage;
          } catch (error) {
            console.error("Error loading language:", error);
            setLanguage('en'); // Fallback to English on error
            i18n.locale = 'en';
          }
        };
      
        loadLanguage();
      }, []);

    const growthStages: GrowthStageOption[] = [
        {
            label: i18n.t('s1'),
            value: "stage1",
            imageSource: "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/Plant+Intial+Stage.png"
        },
        {
            label: i18n.t('s2'),
            value: "stage2",
            imageSource: "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/Plant+Middle+Stage.png"
        },
        {
            label: i18n.t('s3'),
            value: "stage3",
            imageSource: "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/Plant+End+Stage.png"
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

        let cropKC;

        interface Growth {
            ini: { N: string };
            mid: { N: string };
            end: { N: string };
        }

        interface Kc {
            ini: { N: string };
            mid: { N: string };
            end: { N: string };
        }

        const parsedGrowth = JSON.parse(GrowthStage);

        const parsedKc = JSON.parse(kc);


        const kcZones: Growth = {
            ini: {N: parsedKc.M.ini.N},
            mid: {N: parsedKc.M.mid.N},
            end: {N: parsedKc.M.end.N},
        };

        const StageTime: Growth = {
            ini: {N: parsedGrowth.M.ini.N},
            mid: {N: parsedGrowth.M.mid.N},
            end: {N: parsedGrowth.M.end.N},
        };


        if (selectedOption == 'datePlanted') {
            if (selectedDate) {
                // Calculate number of days between selectedDate and today
                const today = new Date();
                const plantedDate = new Date(selectedDate); // Ensure selectedDate is something like a string date or Date object
                const timeDiff = today.getTime() - plantedDate.getTime();
                const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                // Compare daysDiff against StageTime thresholds
                const iniDays = parseInt(StageTime.ini.N, 10);
                const midDays = parseInt(StageTime.mid.N, 10);
                const endDays = parseInt(StageTime.end.N, 10);

                // Determine stage based on daysDiff
                if (daysDiff <= iniDays) {
                    // We are within the initial stage
                    cropKC = kcZones.ini.N;
                } else if (daysDiff <= midDays) {
                    // We are past ini but before mid threshold
                    cropKC = kcZones.mid.N;
                } else if (daysDiff <= endDays) {
                    // We are past mid but before end threshold
                    cropKC = kcZones.end.N;
                } else {
                    // If we are beyond the last defined threshold,
                    // decide what should happen. Possibly still use end stage:
                    cropKC = kcZones.end.N;
                }
            }


        } else if (selectedOption == 'growthStage') {

            if (growthStage == 'stage1') {
                cropKC = kcZones?.ini?.N;
            } else if (growthStage == 'stage2') {
                cropKC = kcZones?.mid?.N;
            } else if (growthStage == 'stage3') {
                cropKC = kcZones?.end?.N;
            }
        }

        let recommendationParams: any = {
            // Data from the previous page
            title: nameEN,
            nameEN: nameEN,
            nameAR:nameAR,
            imageSource: ImageURL,
            kcForCrop: cropKC,
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

    const handleOpenDatePicker = () => {
        setShowDatePicker(true);
    };

    const onDateChange = (event: any, chosenDate: Date | undefined) => {
        setShowDatePicker(false); // Hide picker after selection
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

    
    // testing end

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.header, { 
                backgroundColor: theme.card,
                shadowColor: theme.shadow 
            }]}>
                <Text style={[styles.title, { color: theme.text }]}>{language === 'ar' ? nameAR : nameEN}</Text>
                {ImageURL ? (
                    <Image source={{uri: ImageURL}} style={styles.image}/>
                ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: theme.border }]}>
                        <Text style={[styles.placeholderText, { color: theme.subText }]}>
                            No Image Available
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.mainContent}>
                {/* Location Selection Section */}
                <View style={[styles.section, { 
                    backgroundColor: theme.card,
                    borderColor: theme.border 
                }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('chooseloc')}</Text>
                    <View style={styles.radioButtonsRow}>
                        <CustomRadioButton
                            label={i18n.t('bylocation')}
                            selected={locationMethod === 'auto'}
                            onPress={() => setLocationMethod('auto')}
                            disabled={isAutoDisabled}
                        />
                        <CustomRadioButton
                            label={i18n.t('bydropdown')}
                            selected={locationMethod === 'manual'}
                            onPress={() => setLocationMethod('manual')}
                        />
                    </View>

                    {locationMethod === 'manual' && (
                        <View style={styles.pickerContainer}>
                            <SelectList
                                setSelected={(val) => {
                                    setSelected(val);
                                    handleLocationSelect(val);
                                }}
                                data={locationDataForSelect}
                                placeholder={i18n.t('locationtxt')}
                                boxStyles={[styles.selectBox, { backgroundColor: theme.border }]}
                                dropdownStyles={[styles.dropdown, { backgroundColor: theme.border }]}
                                inputStyles={[styles.selectInput, { color: theme.text }]}
                                dropdownTextStyles={[styles.dropdownText, { color: theme.text }]}
                            />
                        </View>
                    )}
                </View>

                {/* Growth Stage Selection Section */}
                <View style={[styles.section, { 
                    backgroundColor: theme.card,
                    borderColor: theme.border 
                }]}>
                    <View style={styles.radioButtonsRow}>
                        <CustomRadioButton
                            label={i18n.t('datep')}
                            selected={selectedOption === 'datePlanted'}
                            onPress={() => setSelectedOption('datePlanted')}
                        />
                        <CustomRadioButton
                            label={i18n.t('growthstage')}
                            selected={selectedOption === 'growthStage'}
                            onPress={() => setSelectedOption('growthStage')}
                        />
                    </View>

                    {/* Date Selection */}
                    {selectedOption === 'datePlanted' && (
                        <View style={styles.datePickerContainer}>
                            <TouchableOpacity 
                                style={[styles.dateButton, { 
                                    backgroundColor: theme.border,
                                    borderColor: theme.border 
                                }]}
                                onPress={handleOpenDatePicker}
                            >
                                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                    {selectedDate ? selectedDate.toLocaleDateString() : i18n.t('date')}
                                </Text>
                            </TouchableOpacity>

                            {Platform.OS === 'web' ? (
                                showDatePicker && (
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date: Date) => {
                                            setSelectedDate(date);
                                            setShowDatePicker(false);
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        className="dark-theme-datepicker"
                                        placeholderText={i18n.t('date')}
                                    />
                                )
                            ) : (
                                showDatePicker && (
                                    <DateTimePicker
                                        value={selectedDate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                    />
                                )
                            )}
                        </View>
                    )}

                    {/* Growth Stage Selection */}
                    {selectedOption === 'growthStage' && (
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={styles.growthStagesScroll}
                        >
                            {growthStages.map((stage) => (
                                <TouchableOpacity
                                    key={stage.value}
                                    style={[
                                        styles.stageBox,
                                        { backgroundColor: theme.border, borderColor: theme.border },
                                        growthStage === stage.value && [
                                            styles.selectedStageBox,
                                            { borderColor: theme.accent }
                                        ]
                                    ]}
                                    onPress={() => handleStageSelection(stage.value)}
                                >
                                    <Text style={[styles.stageLabel, { color: theme.text }]}>
                                        {stage.label}
                                    </Text>
                                    <Image source={{uri: stage.imageSource}} style={styles.stageImage}/>
                                    <CustomRadioButton
                                        label=""
                                        selected={growthStage === stage.value}
                                        onPress={() => handleStageSelection(stage.value)}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                    style={[
                        styles.calculateButton,
                        (!isButtonEnabled || !isLocationAvailable) 
                            ? [styles.disabledButton, { backgroundColor: theme.border, opacity: 0.7 }]
                            : { backgroundColor: '#4CAF50' }
                    ]}
                    onPress={navigateToRecommendation}
                    disabled={!isButtonEnabled || !isLocationAvailable}
                >
                    <Text style={[
                        styles.calculateButtonText, 
                        { color: (!isButtonEnabled || !isLocationAvailable) ? theme.subText : '#FFFFFF' }
                    ]}>
                        {i18n.t('calcbtn')}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        margin: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mainContent: {
        padding: 16,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 12,
    },
    placeholderImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    radioButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 16,
    },
    pickerContainer: {
        marginTop: 16,
    },
    selectBox: {
    },
    selectInput: {
    },
    dropdown: {
    },
    dropdownText: {
    },
    datePickerContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    dateButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
        minWidth: 200,
        alignItems: 'center',
    },
    dateButtonText: {
        fontSize: 16,
    },
    growthStagesScroll: {
        marginTop: 16,
    },
    stageBox: {
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 160,
        alignItems: 'center',
        borderWidth: 1,
    },
    selectedStageBox: {
        borderWidth: 2,
    },
    stageLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    stageImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 8,
    },
    calculateButton: {
        color:"#2B6CB0",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    disabledButton: {
        opacity: 0.7,
    },
    calculateButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Crop;
