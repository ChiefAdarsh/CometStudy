import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://10.122.152.209:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (response.ok) {
                    const token = data.token;
                    await AsyncStorage.setItem('token', token);
                    navigation.navigate('MainApp'); // Navigate to MainApp which contains the tab navigator
                } else {
                    Alert.alert('Login Failed', data.message);
                }
            } else {
                Alert.alert('Error', 'Invalid response from server');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to login. Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CometStudy</Text>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter username..."
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter password..."
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#0066CC',
        marginBottom: 40,
    },
    formContainer: {
        width: '100%',
        padding: 20,
        borderColor: '#333',
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        color: '#FFF',
    },
});