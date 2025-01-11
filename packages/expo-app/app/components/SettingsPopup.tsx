import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Pressable, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import { useTheme, themes } from './ThemeContext';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsPopupProps {
    visible: boolean;
    onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ visible, onClose }) => {
    const router = useRouter();
    const { isDarkMode, toggleTheme } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;
    const [language, setLanguage] = useState<string | null>(null); // to keep track of the language preference

    const preventClose = (e: any) => {
        e.stopPropagation();
    };

    const handleSignOut = async () => {
        try {
            await storage.removeItem('idToken');
            await storage.removeItem('accessToken');
            onClose();
            router.replace('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    //Retrieve language selected
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

    // Toggle the language and save the preference
    const toggleLanguage = async () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
        i18n.locale = newLang;
        try {
          await AsyncStorage.setItem('language', newLang);
          // Force page refresh
          router.push('/screens/DashBoard') // Navigate to the same route
          await router.replace('/screens/DashBoard');
        } catch (error) {
          console.error('Error saving language:', error);
        }
      };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable 
                    style={[styles.popup, { backgroundColor: theme.card }]}
                    onPress={preventClose}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>{i18n.t('settings')}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.content}>
                        <View style={[styles.option, { backgroundColor: theme.border }]}>
                            <MaterialIcons name="brightness-6" size={24} color={theme.text} />
                            <Text style={[styles.optionText, { color: theme.text }]}>{i18n.t('mode')}</Text>
                            <Switch
                                style={styles.toggle}
                                value={!isDarkMode}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={!isDarkMode ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>

                        <View style={[styles.option, { backgroundColor: theme.border }]}>
                            <MaterialIcons name="language" size={24} color={theme.text} />
                            <Text style={[styles.optionText, { color: theme.text }]}>{i18n.t('arabic')}</Text>
                            <Switch
                                style={styles.toggle}
                                value={language === 'ar'}
                                onValueChange={toggleLanguage}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={!isDarkMode ? '#f5dd4b' : '#f4f3f4'}
                                
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.signOutButton, { 
                                backgroundColor: theme.border,
                                borderColor: '#FF4B4B' 
                            }]}
                            onPress={handleSignOut}
                        >
                            <MaterialIcons name="logout" size={24} color="#FF4B4B" />
                            <Text style={[styles.signOutButtonText, { color: '#FF4B4B' }]}>
                                {i18n.t('so')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        width: '80%',
        backgroundColor: '#2D2F31',
        borderRadius: 15,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        gap: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#404144',
        borderRadius: 10,
        gap: 12,
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
        flex: 1,
    },
    toggle: {
        marginLeft: 'auto',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#404144',
        borderRadius: 10,
        gap: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FF4B4B',
    },
    signOutButtonText: {
        color: '#FF4B4B',
        fontSize: 16,
        flex: 1,
    },
});

export default SettingsPopup;
