// src/screens/MapScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import axios from 'axios'; // Import axios
import CustomMapView from '../components/CustomMapView';
import PlacesSearch from '../components/PlacesSearch';
import PinnedLocations from '../components/PinnedLocations';

const GOOGLE_API_KEY = 'AIzaSyAjUJPXPtiOBeGtodNJIcKbmGnchmaNdu4'; // Replace with your actual API key

const BACKEND_URL = 'http://localhost:8000'; // Change this to your backend's URL

const MapScreen = () => {
    const [markerCoords, setMarkerCoords] = useState([]);
    const [region, setRegion] = useState({
        latitude: 32.9867,
        longitude: -96.7505,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    });
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);

    // Fetch pins from the backend
    useEffect(() => {
        const fetchPins = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/pins`);
                setMarkerCoords(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching pins:', error);
                setLoading(false);
            }
        };
        fetchPins();
    }, []);

    // Handle adding a new pin
    const handleLocationSelect = async (data, details) => {
        if (!details || !details.geometry || !details.geometry.location) {
            return;
        }

        const lat = details.geometry.location.lat;
        const lng = details.geometry.location.lng;
        const name = data.description || 'Unnamed Location';

        try {
            const response = await axios.post(`${BACKEND_URL}/pins`, {
                latitude: lat,
                longitude: lng,
                name,
            });

            const newPin = response.data;
            setMarkerCoords([...markerCoords, newPin]);

            setRegion({
                ...region,
                latitude: lat,
                longitude: lng,
            });

            // Add a slight delay to ensure the map is ready before calling animateToRegion
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }, 1000);
                }
            }, 500); // Delay by 500ms to ensure the map is ready
        } catch (error) {
            console.error('Error adding pin:', error);
        }
    };

    // Handle deleting a pin
    const handleDelete = async (index) => {
        try {
            await axios.delete(`${BACKEND_URL}/pins/${index}`);
            const updatedMarkers = markerCoords.filter((_, i) => i !== index);
            setMarkerCoords(updatedMarkers);
        } catch (error) {
            console.error('Error deleting pin:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading map and pins...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomMapView
                region={region}
                markerCoords={markerCoords}
                GOOGLE_API_KEY={GOOGLE_API_KEY}
            />
            <PlacesSearch GOOGLE_API_KEY={GOOGLE_API_KEY} onLocationSelect={handleLocationSelect} />
            <PinnedLocations markerCoords={markerCoords} onDelete={handleDelete} />
        </View>
    );
};

export default MapScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});