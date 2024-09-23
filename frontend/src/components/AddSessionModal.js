import React, { useState } from 'react';
import {
    View,
    Modal,
    TextInput,
    Button,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Text,
    Alert,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../styles/styles';

const GOOGLE_API_KEY = 'AIzaSyAjUJPXPtiOBeGtodNJIcKbmGnchmaNdu4'; // Replace with your API key

const AddSessionModal = ({
    modalVisible,
    setModalVisible,
    handleAddSession,
    utdBuildings,
}) => {
    const [newSessionName, setNewSessionName] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [roomNumber, setRoomNumber] = useState('');
    const [temporaryExpiryTime, setTemporaryExpiryTime] = useState(new Date(Date.now() + 3600000));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedExpiryTime, setSelectedExpiryTime] = useState(null);

    // Filter the UTD buildings based on the search text
    const [searchText, setSearchText] = useState('');
    const filteredUtdBuildings = utdBuildings.filter((building) =>
        building.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <GooglePlacesAutocomplete
                        placeholder="Select location"
                        minLength={2}
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            setSelectedLocation({
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                            });
                        }}
                        query={{
                            key: GOOGLE_API_KEY,
                            language: 'en',
                        }}
                        styles={{
                            textInput: styles.searchInput,
                            container: { flex: 0 },
                        }}
                        renderRow={(rowData) => {
                            const utdMatch = filteredUtdBuildings.find(building =>
                                rowData.description.toLowerCase().includes(building.toLowerCase())
                            );
                            return utdMatch ? (
                                <Text>{utdMatch}</Text>
                            ) : (
                                <Text>{rowData.description}</Text>
                            );
                        }}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Room Number"
                        value={roomNumber}
                        onChangeText={setRoomNumber}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Name of Study Session"
                        value={newSessionName}
                        onChangeText={setNewSessionName}
                    />

                    <View style={styles.expiryTimeContainer}>
                        <Text style={styles.label}>Expiry Time:</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.timeInputWrapper}>
                            <View pointerEvents="none">
                                <TextInput
                                    style={styles.timeInput}
                                    value={selectedExpiryTime
                                        ? selectedExpiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : temporaryExpiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    editable={false}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedExpiryTime || temporaryExpiryTime}  // Use selectedExpiryTime if available
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                if (event.type === "set") {
                                    // User confirmed the time selection
                                    setSelectedExpiryTime(selectedDate || temporaryExpiryTime);
                                }
                                // Close the picker regardless of whether a date was selected or not
                                setShowDatePicker(Platform.OS === 'ios');
                            }}
                        />
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Add Study Session"
                            onPress={() => {
                                const expiryTimeToUse = selectedExpiryTime || temporaryExpiryTime;

                                if (selectedLocation && newSessionName && roomNumber && expiryTimeToUse) {
                                    const sessionData = {
                                        newSessionName,
                                        selectedLocation,
                                        roomNumber,
                                        temporaryExpiryTime: expiryTimeToUse,  // Use the selected time or the default one
                                    };
                                    console.log('Session Data to be sent:', sessionData);  // Log the session data

                                    handleAddSession(sessionData);
                                    setModalVisible(false);
                                    setNewSessionName('');
                                    setSelectedLocation(null);
                                    setRoomNumber('');
                                    setTemporaryExpiryTime(new Date());
                                    setSelectedExpiryTime(null);
                                } else {
                                    Alert.alert('Error', 'Please fill all the fields.');
                                }
                            }}
                        />
                        <Button
                            title="Cancel"
                            onPress={() => {
                                setModalVisible(false);
                                setNewSessionName('');
                                setSelectedLocation(null);
                                setRoomNumber('');
                                setTemporaryExpiryTime(new Date());
                                setSelectedExpiryTime(null);
                            }}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AddSessionModal;