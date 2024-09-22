// components/StudySessionsList.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

const StudySessionsList = ({ filteredMarkers, getDirections, handleDelete }) => {
    return (
        <View style={styles.studySessionsContainer}>
            <Text style={styles.studyTitle}>Available Study Sessions</Text>
            <ScrollView>
                {filteredMarkers.map((marker) => {
                    const timeRemaining = marker.expiryTime - Date.now();
                    const minutesRemaining = Math.max(Math.ceil(timeRemaining / 60000), 0);
                    const hours = Math.floor(minutesRemaining / 60);
                    const minutes = minutesRemaining % 60;
                    return (
                        <TouchableOpacity key={marker.id} onPress={() => getDirections(marker)}>
                            <View style={styles.locationItem}>
                                <View style={styles.locationTextContainer}>
                                    <Text style={styles.locationName}>{marker.name}</Text>
                                    <Text style={styles.locationDetails}>Room: {marker.roomNumber}</Text>
                                    <Text style={styles.locationDetails}>
                                        Expires in: {hours}h {minutes}m
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(marker.id)}>
                                    <Ionicons name="trash-outline" size={24} color="#ff5c5c" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default StudySessionsList;