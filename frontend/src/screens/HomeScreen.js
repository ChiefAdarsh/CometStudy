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

            // Check if the response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(data);
                if (response.ok) {
                    // Process the data
                    const token = data.token;
                    await AsyncStorage.setItem('token', token);
                    navigation.navigate('Map');
                } else {
                    Alert.alert('Login Failed', data.message);
                }
            } else {
                console.log('Response is not JSON:', response);
                Alert.alert('Error', 'Invalid response from server');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Unable to login. Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login to CometRoute</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
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
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 36,
        color: '#61DAFB',
        marginBottom: 40,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#61DAFB',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        color: '#FFF',
    },
    button: {
        backgroundColor: '#61DAFB',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 24,
        color: '#282C34',
    },
});