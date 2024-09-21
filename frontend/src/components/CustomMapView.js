// src/components/CustomMapView.js

import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const CustomMapView = ({ region, markerCoords, GOOGLE_API_KEY, onRegionChangeComplete }) => {
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
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 0.6, // Map takes up 60% of the screen
    },
});

export default CustomMapView;