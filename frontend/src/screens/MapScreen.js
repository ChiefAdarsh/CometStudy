// src/screens/MapScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons'; // Using Expo's vector icons
import * as Location from 'expo-location';

const GOOGLE_API_KEY = 'AIzaSyAjUJPXPtiOBeGtodNJIcKbmGnchmaNdu4'; // Replace with your actual API key

const MapScreen = () => {
    const [markerCoords, setMarkerCoords] = useState([]);
    const [region, setRegion] = useState({
        latitude: 32.98666382563085, // Default latitude (UTD Campus)
        longitude: -96.75578758822803, // Default longitude (UTD Campus)
        latitudeDelta: 0.005, // Smaller delta for a more zoomed-in view
        longitudeDelta: 0.005,
    });
    const [userLocation, setUserLocation] = useState(null);
    const [heading, setHeading] = useState(0);
    const [loadingLocation, setLoadingLocation] = useState(true);

    const mapRef = useRef(null);

    useEffect(() => {
        (async () => {
            // Request location permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied. The app may not function correctly.');
                setLoadingLocation(false);
                return;
            }

            // Get the current position
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);
            setRegion({
                ...region,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            setLoadingLocation(false);

            // Subscribe to heading updates
            const headingSubscription = await Location.watchHeadingAsync((headingData) => {
                setHeading(headingData.trueHeading);
            });

            // Optionally, subscribe to location updates if you want the map to follow the user
            const locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (loc) => {
                    setUserLocation(loc.coords);
                    setRegion({
                        ...region,
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                }
            );

            // Cleanup subscriptions on unmount
            return () => {
                headingSubscription && headingSubscription.remove();
                locationSubscription && locationSubscription.remove();
            };
        })();
    }, []);

    // Function to handle location selection from autocomplete
    const handleLocationSelect = (data, details) => {
        if (!details || !details.geometry || !details.geometry.location) {
            console.warn('Invalid location details');
            return;
        }

        const lat = details.geometry.location.lat;
        const lng = details.geometry.location.lng;
        const name = data.description || 'Unnamed Location';

        const newMarker = {
            latitude: lat,
            longitude: lng,
            name, // Name of the location
        };

        setMarkerCoords([...markerCoords, newMarker]);
        setRegion({
            ...region,
            latitude: lat,
            longitude: lng,
        });

        // Optionally, move the map to the new region
        mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 1000);
    };

    // Function to handle deletion of a pin
    const handleDelete = (index) => {
        const updatedMarkers = markerCoords.filter((_, i) => i !== index);
        setMarkerCoords(updatedMarkers);
    };

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
            {/* Map View */}
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                showsUserLocation={true}
                showsCompass={true}
                rotateEnabled={true}
                pitchEnabled={true}
                scrollEnabled={true}
                zoomEnabled={true}
                followsUserLocation={true}
            >
                {markerCoords.map((coord, index) => (
                    <Marker key={index} coordinate={coord} title={coord.name} />
                ))}

                {/* Draw routes between consecutive markers */}
                {markerCoords.length > 1 &&
                    markerCoords.map((coord, index) => {
                        if (index === 0) return null;
                        const origin = markerCoords[index - 1];
                        const destination = coord;
                        return (
                            <MapViewDirections
                                key={`direction-${index}`}
                                origin={origin}
                                destination={destination}
                                apikey={GOOGLE_API_KEY}
                                strokeWidth={3}
                                strokeColor="hotpink"
                                mode="WALKING" // Set mode to walking
                                onError={(errorMessage) => {
                                    console.error(`Error: ${errorMessage}`);
                                }}
                            />
                        );
                    })}
            </MapView>

            {/* Google Places Autocomplete Search Bar */}
            <GooglePlacesAutocomplete
                placeholder="Search for a place"
                minLength={2}
                fetchDetails={true}
                onPress={handleLocationSelect}
                query={{
                    key: GOOGLE_API_KEY,
                    language: 'en',
                }}
                styles={{
                    container: styles.searchContainer,
                    textInput: styles.searchInput,
                }}
                nearbyPlacesAPI="GooglePlacesSearch"
                debounce={200}
            />

            {/* Pinned Locations Box */}
            <View style={styles.pinnedLocationsContainer}>
                <Text style={styles.pinnedTitle}>Pinned Locations</Text>
                <ScrollView>
                    {markerCoords.map((marker, index) => (
                        <View key={index} style={styles.locationItem}>
                            <View style={styles.locationTextContainer}>
                                <Text style={styles.locationName}>{marker.name}</Text>
                                <Text style={styles.locationCoords}>
                                    Lat: {marker.latitude.toFixed(4)}, Lng: {marker.longitude.toFixed(4)}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(index)}>
                                <Ionicons name="trash-outline" size={24} color="#ff5c5c" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default MapScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 0.6, // Map takes up 60% of the screen
    },
    searchContainer: {
        position: 'absolute',
        top: 80, // Adjust this value to move the search bar down
        width: '90%',
        alignSelf: 'center',
        zIndex: 1,
    },
    searchInput: {
        height: 40,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        borderRadius: 5,
        elevation: 2, // Adds shadow on Android
    },
    pinnedLocationsContainer: {
        flex: 0.4, // Pinned locations box takes up 40% of the screen
        backgroundColor: '#f7f7f7',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 10,
        zIndex: -1,
    },
    pinnedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    locationItem: {
        flexDirection: 'row', // Align delete button and text in a row
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        elevation: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationTextContainer: {
        flexDirection: 'column',
        flex: 1, // Ensure text container takes up available space
        paddingRight: 10, // Space between text and delete button
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationCoords: {
        fontSize: 14,
        color: '#555',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});