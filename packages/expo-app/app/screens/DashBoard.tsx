import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';

// Import multiple images
const Image1 = require("../../assets/images/adaptive-icon.png");
const Image2 = require("../../assets/images/adaptive-icon.png");
const Image3 = require("../../assets/images/adaptive-icon.png");
const Image4 = require("../../assets/images/adaptive-icon.png");
const Image5 = require("../../assets/images/adaptive-icon.png");
const Image6 = require("../../assets/images/adaptive-icon.png");

const Index: React.FC = () => {
  return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.text}>Home screen</Text>

        <View style={styles.grid}>
          <View style={styles.row}>
            <Card imageSource={Image1} title="Broccoli" />
            <Card imageSource={Image2} title="Corn" />
            <Card imageSource={Image3} title="Beetroot" />
          </View>
          <View style={styles.row}>
            <Card imageSource={Image4} title="Cauliflower" />
            <Card imageSource={Image5} title="Cucumber" />
            <Card imageSource={Image6} title="Lettuce" />
          </View>
        </View>
      </ScrollView>
  );
};

interface CardProps {
  imageSource: any; // Use 'any' for image source, or refine as needed
  title: string;
}

const Card: React.FC<CardProps> = ({ imageSource, title }) => {
  return (
      <View style={styles.cardContainer}>
        <Image source={imageSource} style={styles.image} />
        <Text style={styles.cardTitle}>{title}</Text>

        {/* Link to Crop page without parameters */}
        <Link
            href="/screens/Crop"  // Simply navigate to the Crop page without passing params
            style={styles.link}
        >
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Calculate water need</Text>
          </TouchableOpacity>
        </Link>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    padding: 10,
    alignItems: 'center',
    width: '30%',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  cardTitle: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  link: {
    width: '100%',
    textAlign: 'center',
  },
});

export default Index;
