import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

// Props type definition for navigation
type InputPageProps = {
  navigation: {
    goBack: () => void;
  };
};

const InputPage: React.FC<InputPageProps> = ({ navigation }) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleButtonPress = () => {
    // Logic for button press, use inputValue here
    alert(`You entered: ${inputValue}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome to SAQI</Text>
      
      {/* Text above the input */}
      <Text style={styles.infoText}>Please enter you phone number</Text>
      
      {/* Input field */}
      <TextInput
        style={styles.input}
        placeholder="Enter value here"
        value={inputValue}
        onChangeText={setInputValue}
        keyboardType="numeric"
      />
      
      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>validate</Text>
      </TouchableOpacity>
      
      {/* Text below the button */}
      
      {/* Button to navigate back to home screen */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '20%',
    height: 40,
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
    color: '#fff',
    backgroundColor: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
});

export default InputPage;
