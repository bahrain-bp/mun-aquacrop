import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import { Link } from 'expo-router';

// Import multiple images
const Image1 = require("../../assets/images/broccoli-wb.jpg");
const Image2 = require("../../assets/images/corn-wb.jpg");
const Image3 = require("../../assets/images/beetroot-wb.jpg");
const Image4 = require("../../assets/images/cauliflower-wb.jpeg");
const Image5 = require("../../assets/images/cucumber-wb.jpeg");
const Image6 = require("../../assets/images/lettuce-wb.jpeg");

export default function Index() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.text}>Home screen</Text>
      
      {/* Create a grid layout for images */}
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
        
        <Link href="/about" style={styles.button}>
          Go to About screen
        </Link>
      </View>
    </ScrollView>
  );
}

const Card = ({ imageSource, title }) => (
  <View style={styles.cardContainer}>
    <Image source={imageSource} style={styles.image} />
    <Text style={styles.cardTitle}>{title}</Text>
    <TouchableOpacity style={styles.button} onPress={() => alert(`${title} button pressed`)}>
      <Text style={styles.buttonText}>Calculate water need</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20, // Added padding to the container
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Ensures there's space at the bottom of the content
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
    width: '100%', // Ensures the grid takes up full width of the screen
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Ensures cards are spaced evenly
    width: '100%', // Full width for the row
    marginBottom: 20, // Space between rows
  },
  cardContainer: {
    backgroundColor: '#D3D3D3', // Light gray background color
    borderRadius: 10,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    padding: 10,
    alignItems: 'center',
    width: '30%', // Width of each card is 30% of the screen's width
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
});
