import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
} from 'react-native';
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
                    const userId = data.userId;

                    await AsyncStorage.setItem('token', token);
                    await AsyncStorage.setItem('user', JSON.stringify({ userId }));

                    navigation.navigate('MainApp');
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
        
            <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/17/University_of_Texas_at_Dallas_seal.svg/1200px-University_of_Texas_at_Dallas_seal.svg.png' }} // Replace with your app's logo URL or import
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.title}>Welcome to CometStudy</Text>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#888"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholderTextColor="#888"
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign up</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 40,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        padding: 20,
        borderColor: '#E5E5E5',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
    },
    button: {
        backgroundColor: '#0066CC',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '600',
    },
    signupText: {
        marginTop: 20,
        color: '#555',
        textAlign: 'center',
        fontSize: 14,
    },
    signupLink: {
        color: '#0066CC',
        fontWeight: 'bold',
    },
});