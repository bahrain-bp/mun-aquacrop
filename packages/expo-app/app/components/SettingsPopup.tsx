import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Pressable, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { storage } from '../utils/storage';
import { useTheme, themes } from './ThemeContext';

interface SettingsPopupProps {
    visible: boolean;
    onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ visible, onClose }) => {
    const router = useRouter();
    const { isDarkMode, toggleTheme } = useTheme();
    const theme = isDarkMode ? themes.dark : themes.light;

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
                        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.content}>
                        <View style={[styles.option, { backgroundColor: theme.border }]}>
                            <MaterialIcons name="brightness-6" size={24} color={theme.text} />
                            <Text style={[styles.optionText, { color: theme.text }]}>Light Mode</Text>
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
                            <Text style={[styles.optionText, { color: theme.text }]}>Arabic</Text>
                            <Switch
                                style={styles.toggle}
                                value={false}
                                //onValueChange={}
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
                                Sign Out
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
