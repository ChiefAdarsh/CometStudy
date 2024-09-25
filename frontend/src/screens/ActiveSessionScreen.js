import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const ActiveSessionScreen = ({ navigation }) => {
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null); 

   
    useEffect(() => {
        const fetchUserId = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserId(parsedUser.userId); 

                console.log('No user found in AsyncStorage.');
            }
        };
        fetchUserId();
    }, []);

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
    

    const leaveSession = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'No token found, please log in again.');
                return;
            }

            const response = await fetch(`http://10.122.152.209:8000/sessions/${activeSession.id}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                Alert.alert('Success', 'You have left the session.');
                setActiveSession(null); 
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to leave session.');
            }
        } catch (error) {
            console.error('Error leaving session:', error);
            Alert.alert('Error', error.message || 'Unable to leave session.');
        }
    };

    const deleteSession = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'No token found, please log in again.');
                return;
            }

            const response = await fetch(`http://10.122.152.209:8000/sessions/${activeSession.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                Alert.alert('Success', 'Session deleted successfully.');
                setActiveSession(null); 
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete session.');
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            Alert.alert('Error', error.message || 'Unable to delete session.');
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


                {userId === activeSession.userId ? (
                    <TouchableOpacity style={styles.deleteButton} onPress={deleteSession}>
                        <Text style={styles.deleteButtonText}>Delete Session</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.leaveButton} onPress={leaveSession}>
                        <Text style={styles.leaveButtonText}>Leave Session</Text>
                    </TouchableOpacity>
                )}
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
        paddingTop: 175,
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
    leaveButton: {
        backgroundColor: '#ff3b30',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
    },
    leaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ActiveSessionScreen;