// src/components/PinnedLocations.js

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PinnedLocations = ({ markerCoords, onDelete }) => {
    return (
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
                        <TouchableOpacity onPress={() => onDelete(index)}>
                            <Ionicons name="trash-outline" size={24} color="#ff5c5c" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    pinnedLocationsContainer: {
        flex: 0.4,
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
        flexDirection: 'row',
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
        flex: 1,
        paddingRight: 10,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationCoords: {
        fontSize: 14,
        color: '#555',
    },
});

export default PinnedLocations;