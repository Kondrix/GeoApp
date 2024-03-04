import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ustawienia</Text>
      <Button title="Opcja 1" onPress={() => console.log('Opcja 1 wybrana')} />
      <Button title="Opcja 2" onPress={() => console.log('Opcja 2 wybrana')} />
      <Button title="Opcja 3" onPress={() => console.log('Opcja 3 wybrana')} />
      <Button title="Opcja 4" onPress={() => console.log('Opcja 4 wybrana')} />
      <Button title="Opcja 5" onPress={() => console.log('Opcja 5 wybrana')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default SettingsScreen;
