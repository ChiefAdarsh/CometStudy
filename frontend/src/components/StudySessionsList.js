import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

const StudySessionsList = ({
    filteredMarkers,
    getDirections,
    showCallout, 
    handleDelete,
}) => {
    const [isEditMode, setIsEditMode] = useState(false);

    
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

               
                <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
                    <Text style={styles.editButtonText}>
                        {isEditMode ? 'Done' : 'Edit'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                {filteredMarkers.map((marker) => {
                    
                    const expiryTime = new Date(marker.expiryTime);

                  
                    const currentTime = new Date();
                    const timeRemaining = expiryTime - currentTime;
                    const minutesRemaining = Math.max(
                        Math.ceil(timeRemaining / 60000),
                        0
                    ); 
                    const hours = Math.floor(minutesRemaining / 60);
                    const minutes = minutesRemaining % 60;

                    return (
                        <View key={marker.id} style={styles.locationItemContainer}>
                            {isEditMode && (
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
                                        showCallout(marker.id); 
                                        getDirections(marker);
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

                                  
                                    {marker.description && (
                                        <Text style={styles.locationDetails}>
                                            Description: {marker.description}
                                        </Text>
                                    )}
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