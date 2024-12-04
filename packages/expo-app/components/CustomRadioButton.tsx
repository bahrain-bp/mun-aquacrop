// components/CustomRadioButton.tsx

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

interface CustomRadioButtonProps {
    label: string;
    selected: boolean;
    onPress: () => void;
    disabled?: boolean;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({ label, selected, onPress, disabled = false }) => {
    return (
        <TouchableOpacity
            style={[styles.container, disabled && styles.disabledContainer]}
            onPress={disabled ? undefined : onPress}
            activeOpacity={disabled ? 1 : 0.7}
        >
            <View style={[
                styles.outerCircle,
                selected && styles.selectedOuterCircle,
                disabled && styles.disabledOuterCircle
            ]}>
                {selected && <View style={styles.innerCircle} />}
            </View>
            <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    disabledContainer: {
        opacity: 0.5,
    },
    outerCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#555',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },
    selectedOuterCircle: {
        borderColor: '#4CAF50',
    },
    disabledOuterCircle: {
        borderColor: '#aaa',
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
    },
    label: {
        fontSize: 16,
        color: '#555',
    },
    disabledLabel: {
        color: '#aaa',
    },
});

export default CustomRadioButton;
