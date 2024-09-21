import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

const CustomMapView = ({ region, markerCoords, GOOGLE_API_KEY, onRegionChangeComplete }) => {
    const [currentLocation, setCurrentLocation] = useState(null);

    const routeColors = ['hotpink', 'blue', 'green', 'orange', 'purple']; // Different colors for each route

    useEffect(() => {
        let locationSubscription;
        const startWatchingLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    throw new Error('Permission to access location denied');
                }

                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        distanceInterval: 1,
                    },
                    (location) => {
                        const { latitude, longitude } = location.coords;
                        setCurrentLocation({ latitude, longitude });
                    }
                );
            } catch (error) {
                console.error("Error watching location: ", error);
            }
        };

        startWatchingLocation();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, []);

    return (
        <MapView
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsCompass={true}
            rotateEnabled={true}
            pitchEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            followsUserLocation={true}
            onRegionChangeComplete={onRegionChangeComplete}
        >
            {markerCoords.map((coord, index) => (
                <Marker key={index} coordinate={coord} title={coord.name} />
            ))}

            {currentLocation && markerCoords.length > 0 && (
                <MapViewDirections
                    origin={currentLocation}
                    destination={markerCoords[0]} // Destination is first pin
                    apikey={GOOGLE_API_KEY}
                    strokeWidth={3}
                    strokeColor={routeColors[0]} // Use the first color for the first route
                    mode="WALKING"
                    onError={(errorMessage) => {
                        console.error(`Error: ${errorMessage}`);
                    }}
                />
            )}

            {markerCoords.length > 1 &&
                markerCoords.map((coord, index) => {
                    if (index === 0) return null;
                    const origin = markerCoords[index - 1];
                    const destination = coord;
                    const color = routeColors[index % routeColors.length]; // Cycle through route colors

                    return (
                        <MapViewDirections
                            key={`direction-${index}`}
                            origin={origin}
                            destination={destination}
                            apikey={GOOGLE_API_KEY}
                            strokeWidth={3}
                            strokeColor={color} // Assign color based on index
                            mode="WALKING"
                            onError={(errorMessage) => {
                                console.error(`Error: ${errorMessage}`);
                            }}
                        />
                    );
                })}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 0.6,
    },
});

export default CustomMapView;