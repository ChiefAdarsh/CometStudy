// screens/MapScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AddSessionModal from '../components/AddSessionModal';
import StudySessionsList from '../components/StudySessionsList';
import { styles } from '../styles/styles';
import { decodePolyline } from '../utils/polylineDecoder';
import { utdBuildings } from './utdBuildings';


const GOOGLE_API_KEY = 'AIzaSyAjUJPXPtiOBeGtodNJIcKbmGnchmaNdu4'; // Replace with your API key
const BACKEND_URL = 'http://localhost:8000'; // Update with your backend URL

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
        fetch(`${BACKEND_URL}/sessions`)
            .then(response => response.json())
            .then(data => {
                setMarkerCoords(data);
            })
            .catch(error => {
                console.error('Error fetching study sessions:', error);
            });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = Date.now();
            const updatedMarkers = markerCoords.filter(
                (marker) => marker.expiryTime > currentTime
            );
            if (updatedMarkers.length !== markerCoords.length) {
                setMarkerCoords(updatedMarkers);
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [markerCoords]);

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

    const handleAddSession = ({ newSessionName, selectedLocation, roomNumber, temporaryExpiryTime }) => {
        let expiryTimestamp = new Date(temporaryExpiryTime);
        expiryTimestamp.setSeconds(0);
        expiryTimestamp.setMilliseconds(0);

        if (expiryTimestamp.getTime() <= Date.now()) {
            expiryTimestamp.setDate(expiryTimestamp.getDate() + 1);
        }

        const newMarker = {
            id: Date.now().toString(),
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            name: newSessionName,
            roomNumber: roomNumber,
            expiryTime: expiryTimestamp.getTime(),
        };

        // Send POST request to backend
        fetch(`${BACKEND_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMarker),
        })
            .then(response => response.json())
            .then(data => {
                setMarkerCoords([...markerCoords, data]);
            })
            .catch(error => {
                console.error('Error adding study session:', error);
            });
    };

    const handleDelete = (id) => {
        // Send DELETE request to backend
        fetch(`${BACKEND_URL}/sessions/${id}`, {
            method: 'DELETE',
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