import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

const StudySessionsList = ({
    filteredMarkers,
    getDirections,
    handleDelete,
}) => {
    const [isEditMode, setIsEditMode] = useState(false);  // Add state to track edit mode

    // Function to confirm deletion
    const confirmDelete = (id) => {
        Alert.alert('Delete Session', 'Are you sure you want to delete this session?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) },
        ]);
    };

    return (
        <View style={styles.studySessionsContainer}>
            <View style={styles.studyTitleContainer}>
                <Text style={styles.studyTitle}>Available Study Sessions</Text>

                {/* Toggle Edit Mode */}
                <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
                    <Text style={styles.editButtonText}>
                        {isEditMode ? 'Done' : 'Edit'}  {/* Toggle text between 'Edit' and 'Done' */}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                {filteredMarkers.map((marker) => {
                    // Convert the expiryTime to a Date object
                    const expiryTime = new Date(marker.expiryTime);

                    // Calculate the time difference between now and the expiry time
                    const currentTime = new Date();
                    const timeRemaining = expiryTime - currentTime;
                    const minutesRemaining = Math.max(
                        Math.ceil(timeRemaining / 60000),
                        0
                    ); // Convert milliseconds to minutes
                    const hours = Math.floor(minutesRemaining / 60);
                    const minutes = minutesRemaining % 60;

                    return (
                        <View key={marker.id} style={styles.locationItemContainer}>
                            {isEditMode && (  // Conditionally show the delete button only in edit mode
                                <TouchableOpacity
                                    onPress={() => confirmDelete(marker.id)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="remove-circle" size={24} color="#ff3b30" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.locationItem}
                                onPress={() => {
                                    if (!isEditMode) {
                                        getDirections(marker);  // Don't navigate if in edit mode
                                    }
                                }}
                            >
                                <View style={styles.locationTextContainer}>
                                    <Text style={styles.locationName}>{marker.name}</Text>
                                    <Text style={styles.locationDetails}>
                                        Room: {marker.roomNumber}
                                    </Text>
                                    <Text style={styles.locationDetails}>
                                        Expires in: {hours}h {minutes}m
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default StudySessionsList;