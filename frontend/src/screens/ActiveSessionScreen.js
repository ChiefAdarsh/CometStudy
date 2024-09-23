// src/screens/ActiveSessionScreen.js

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';  // Import useFocusEffect

const ActiveSessionScreen = ({ navigation }) => {
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch the active session data
    const fetchActiveSession = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://10.122.152.209:8000/sessions/active', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setActiveSession(data);
            } else {
                setActiveSession(null);
            }
        } catch (error) {
            console.error('Error fetching active session:', error);
            setActiveSession(null);
        } finally {
            setLoading(false);
        }
    };

    // Use useFocusEffect to refetch the session every time the screen is focused
    useFocusEffect(
        React.useCallback(() => {
            setLoading(true);  // Show loading indicator
            fetchActiveSession();  // Fetch active session data
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Loading your active session...</Text>
            </View>
        );
    }

    if (!activeSession) {
        return (
            <View style={styles.container}>
                <Text>You do not have an active study session. Please create one.</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Active Study Session</Text>
            <Text style={styles.detail}>Name: {activeSession.name}</Text>
            <Text style={styles.detail}>Room: {activeSession.roomNumber}</Text>
            <Text style={styles.detail}>Expires At: {new Date(activeSession.expiryTime).toLocaleTimeString()}</Text>
            <Text style={styles.detail}>Latitude: {activeSession.latitude}</Text>
            <Text style={styles.detail}>Longitude: {activeSession.longitude}</Text>

            <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    detail: {
        fontSize: 18,
        marginBottom: 10,
    },
});

export default ActiveSessionScreen;