import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
    const handleGetStarted = () => {
        navigation.navigate('Map');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CometRoute</Text>
            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#282C34',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 48,
        color: '#61DAFB',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#61DAFB',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    buttonText: {
        fontSize: 24,
        color: '#282C34',
    },
});