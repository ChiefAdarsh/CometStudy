import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const ActiveSessionScreen = ({ navigation }) => {
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useFocusEffect(
        React.useCallback(() => {
            setLoading(true);
            fetchActiveSession();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Loading your active session...</Text>
            </View>
        );
    }

    if (!activeSession) {
        return (
            <View style={styles.noSessionContainer}>
                <Ionicons name="sad-outline" size={64} color="gray" />
                <Text style={styles.noSessionText}>You do not have an active study session.</Text>
                <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Active Study Session</Text>
                <Text style={styles.detail}><Text style={styles.label}>Name: </Text>{activeSession.name}</Text>
                <Text style={styles.detail}><Text style={styles.label}>Room: </Text>{activeSession.roomNumber}</Text>
                <Text style={styles.detail}>
                    <Text style={styles.label}>Expires At: </Text>
                    {new Date(activeSession.expiryTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>

                {/* Display a map preview with a marker */}
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: activeSession.latitude,
                        longitude: activeSession.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: activeSession.latitude,
                            longitude: activeSession.longitude,
                        }}
                        title={activeSession.name}
                        description={`Room: ${activeSession.roomNumber}`}
                    />
                </MapView>
            </View>

            <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        padding: 20,
        alignItems: 'center',
        paddingTop: 175,  // Add padding to move content down
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#007AFF',
        textAlign: 'center',
    },
    detail: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        color: '#007AFF',
    },
    map: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noSessionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    noSessionText: {
        fontSize: 18,
        color: 'gray',
        marginTop: 20,
        textAlign: 'center',
    },
    goBackButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
    },
    goBackText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    label: {
        color: 'blue',
        fontWeight: 'bold',
    },
    detail: {
        fontSize: 18,
        marginBottom: 10,
    },
});

export default ActiveSessionScreen;