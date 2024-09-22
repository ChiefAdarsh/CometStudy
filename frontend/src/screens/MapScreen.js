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
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddSessionModal from '../components/AddSessionModal';
import StudySessionsList from '../components/StudySessionsList';
import { styles } from '../styles/styles';
import { decodePolyline } from '../utils/polylineDecoder';
import { utdBuildings } from './utdBuildings';

const GOOGLE_API_KEY = 'AIzaSyAjUJPXPtiOBeGtodNJIcKbmGnchmaNdu4'; // Replace with your API key
const BACKEND_URL = 'http://10.122.152.209:8000'; // Update with your backend URL

const MapScreen = () => {
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
        // Fetch study sessions from the backend
        const fetchSessions = async () => {
            try {
                const token = await AsyncStorage.getItem('token');  // Get token from AsyncStorage
                const response = await fetch(`${BACKEND_URL}/sessions`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Attach token to the Authorization header
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setMarkerCoords(data);
                } else {
                    Alert.alert('Error', 'Unable to fetch study sessions');
                }
            } catch (error) {
                Alert.alert('Error', 'Unable to fetch study sessions. Please try again later.');
            }
        };

        fetchSessions();
    }, []);

    const handleAddSession = async (newSession) => {
        try {
            const token = await AsyncStorage.getItem('token');  // Get token from AsyncStorage

            const response = await fetch(`${BACKEND_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Attach token to the Authorization header
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSession),
            });

            if (response.ok) {
                const session = await response.json();
                setMarkerCoords((prev) => [...prev, session]);
            } else {
                Alert.alert('Error', 'Unable to add study session');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to add study session. Please try again later.');
        }
    };

    const getDirections = async (destination) => {
        const origin = `${userLocation.latitude},${userLocation.longitude}`;
        const dest = `${destination.latitude},${destination.longitude}`;
        const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${GOOGLE_API_KEY}&mode=walking`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.routes.length > 0) {
                const points = decodePolyline(data.routes[0].overview_polyline.points);
                setDirectionsPath(points);
                mapRef.current.fitToCoordinates(points, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        } catch (error) {
            console.error("Error fetching directions:", error);
        }
    };

    const handleDelete = (id) => {
        // Send DELETE request to backend
        fetch(`${BACKEND_URL}/sessions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,  // Attach token to the Authorization header
            }
        })
            .then(response => response.json())
            .then(data => {
                const updatedMarkers = markerCoords.filter((marker) => marker.id !== id);
                setMarkerCoords(updatedMarkers);
            })
            .catch(error => {
                console.error('Error deleting study session:', error);
            });
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
                {filteredMarkers.map((coord) => (
                    <Marker key={coord.id} coordinate={coord}>
                        <Callout>
                            <View style={styles.calloutView}>
                                <Text style={styles.calloutTitle}>{coord.name}</Text>
                                <Text style={styles.calloutText}>Room: {coord.roomNumber}</Text>
                                <Text style={styles.calloutText}>
                                    Expires at: {new Date(coord.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="add-circle" size={80} color="#007AFF" />
            </TouchableOpacity>

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