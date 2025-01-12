// Country code prefix component in the login page (phone number input)
import React from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const countries = [
  { code: 'BH', name: 'Bahrain', dial_code: '+973', flag: '🇧🇭' },
  { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait', dial_code: '+965', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', dial_code: '+968', flag: '🇴🇲' },
  { code: 'QA', name: 'Qatar', dial_code: '+974', flag: '🇶🇦' },
];

interface CountrySelectProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: { code: string; dial_code: string; flag: string }) => void;
}

const CountrySelect = ({ visible, onClose, onSelect }: CountrySelectProps) => {
  const [search, setSearch] = React.useState('');
  
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dial_code.includes(search)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Select Country</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search country..."
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.dialCode}>{item.dial_code}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 5,
  },
  searchInput: {
    margin: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  flag: {
    fontSize: 24,
    marginRight: 10,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
  },
  dialCode: {
    fontSize: 16,
    color: '#666',
  },
});

export default CountrySelect;
