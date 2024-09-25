import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddSessionModal from '../components/AddSessionModal';
import StudySessionsList from '../components/StudySessionsList';
import { styles } from '../styles/styles';
import { decodePolyline } from '../utils/polylineDecoder';
import { utdBuildings } from './utdBuildings';

const GOOGLE_API_KEY = 'AIzaSyAvGxdBp1HKySVrivYF8d5pt589O9K5hUY'; // Replace with your API key

const MapScreen = ({ navigation }) => {
    const [markerCoords, setMarkerCoords] = useState([]);
    const [region, setRegion] = useState({
        latitude: 32.9867,
        longitude: -96.7505,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });
    const [userLocation, setUserLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [directionsPath, setDirectionsPath] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    // State to track if the user has an active session
    const [hasActiveSession, setHasActiveSession] = useState(false);

    const mapRef = useRef(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied.');
                setLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);
            setRegion((prevRegion) => ({
                ...prevRegion,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            }));
            setLoadingLocation(false);
        })();
    }, []);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    Alert.alert('Error', 'No token found, please log in again.');
                    return;
                }

                const response = await fetch(`http://10.122.152.209:8000/sessions`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch study sessions.');
                }

                const { allSessions, activeSession } = await response.json();
                setMarkerCoords(allSessions);  // Update state with all sessions

                // If the user has an active session, set the state
                if (activeSession) {
                    setHasActiveSession(true);
                } else {
                    setHasActiveSession(false);
                }
            } catch (error) {
                console.error('Error fetching study sessions:', error);
                Alert.alert('Error', error.message || 'Unable to fetch study sessions.');
            }
        };

        fetchSessions();
    }, []);

    const handleAddSession = async (newSession) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`http://10.122.152.209:8000/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: Date.now().toString(),
                    latitude: newSession.selectedLocation.latitude,
                    longitude: newSession.selectedLocation.longitude,
                    name: newSession.newSessionName,
                    roomNumber: newSession.roomNumber,
                    expiryTime: new Date(newSession.temporaryExpiryTime).toISOString(),
                }),
            });

            if (response.ok) {
                const session = await response.json();
                setMarkerCoords((prev) => [...prev, session]);
                setHasActiveSession(true);  // Set active session after successfully adding a session
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add session.');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Unable to add study session. Please try again later.');
        }
    };

    const getDirections = async (destination) => {
        const origin = `${userLocation.latitude},${userLocation.longitude}`;
        const dest = `${destination.latitude},${destination.longitude}`;
        const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${GOOGLE_API_KEY}&mode=walking`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const points = decodePolyline(data.routes[0].overview_polyline.points);
                setDirectionsPath(points);

                mapRef.current.fitToCoordinates(points, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            } else {
                console.error('No routes found or an error occurred:', data);
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');

            // Make the DELETE request to the backend
            const response = await fetch(`http://10.122.152.209:8000/sessions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Remove the deleted session from the frontend state
                const updatedMarkers = markerCoords.filter((marker) => marker.id !== id);
                setMarkerCoords(updatedMarkers);

                // Check if the deleted session belonged to the current user
                const user = await AsyncStorage.getItem('user');
                const { userId } = JSON.parse(user);

                const deletedSession = markerCoords.find((marker) => marker.id === id);

                // If the deleted session belonged to the logged-in user, set hasActiveSession to false
                if (deletedSession && deletedSession.userId === userId) {
                    setHasActiveSession(false);  // Re-enable the Add button for the user
                }
            } else {
                const errorData = await response.json();
                //console.error('Failed to delete session:', errorData);
                //Alert.alert('Error', errorData.message || 'Failed to delete session');
            }
        } catch (error) {
            //console.error('Error deleting study session:', error);
            //Alert.alert('Error', 'Failed to delete session due to an internal error.');
        }
    };



    const filteredMarkers = markerCoords.filter((marker) =>
        marker.name.toLowerCase().includes(searchText.toLowerCase()) ||
        marker.roomNumber.toLowerCase().includes(searchText.toLowerCase())
    );

    if (loadingLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Fetching your location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                showsUserLocation={true}
            >
                {markerCoords.map((coord) => (
                    <Marker key={coord.id} coordinate={coord}>
                        <Callout onPress={() => getDirections(coord)}>
                            <View style={styles.calloutView}>
                                <Text style={styles.calloutTitle}>{coord.name}</Text>
                                <Text style={styles.calloutText}>Room: {coord.roomNumber}</Text>
                                <Text style={styles.calloutText}>
                                    Expires at:{' '}
                                    {new Date(coord.expiryTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}

                {directionsPath.length > 0 && (
                    <Polyline
                        coordinates={directionsPath}
                        strokeWidth={4}
                        strokeColor="blue"
                    />
                )}
            </MapView>



            <TextInput
                style={styles.topSearchInput}
                placeholder="Search Study Sessions"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#888"
            />

            {/* Conditionally render the Add button based on active session */}
            {!hasActiveSession && (
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle" size={80} color="#007AFF" />
                </TouchableOpacity>
            )}

            {/* AddSessionModal */}
            <AddSessionModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                handleAddSession={handleAddSession}
                utdBuildings={utdBuildings}
            />

            <StudySessionsList
                filteredMarkers={filteredMarkers}
                getDirections={getDirections}
                handleDelete={handleDelete}
            />
        </View>
    );
};

export default MapScreen;  