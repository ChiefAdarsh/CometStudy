import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {

    const handleSignOut = async () => {
        try {
            // Clear the token from AsyncStorage
            await AsyncStorage.removeItem('token');
            Alert.alert('Signed Out', 'You have been signed out.');

            // Navigate back to the HomeScreen (or login screen)
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],  // Assuming 'Home' is the login screen
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Settings</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    text: {
        fontSize: 24,
        marginBottom: 20,
    },
    signOutButton: {
        backgroundColor: '#ff5c5c',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginTop: 20,
    },
    signOutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});