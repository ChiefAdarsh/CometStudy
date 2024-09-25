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
    FlatList,
    Alert,
    StyleSheet,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../styles/styles';
import { courseList } from '../context/CourseList';

const GOOGLE_API_KEY = 'AIzaSyAvGxdBp1HKySVrivYF8d5pt589O9K5hUY';  

const AddSessionModal = ({
    modalVisible,
    setModalVisible,
    handleAddSession,
    utdBuildings,
}) => {
    const [newSessionName, setNewSessionName] = useState('');
    const [description, setDescription] = useState('');  
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [roomNumber, setRoomNumber] = useState('');
    const [temporaryExpiryTime, setTemporaryExpiryTime] = useState(new Date(Date.now() + 3600000));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedExpiryTime, setSelectedExpiryTime] = useState(null);

    const handleCourseInput = (text) => {
        setNewSessionName(text);
        if (text.length > 0) {
            const filtered = courseList.filter(course =>
                course.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses([]);
        }
    };

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
                            const utdMatch = utdBuildings.find(building =>
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
                        onChangeText={handleCourseInput}
                    />

                    {filteredCourses.length > 0 && (
                        <FlatList
                            style={customStyles.suggestionsList}
                            data={filteredCourses}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={customStyles.suggestionItem}
                                    onPress={() => {
                                        setNewSessionName(item);
                                        setFilteredCourses([]);
                                    }}
                                >
                                    <Text style={customStyles.suggestionText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <TextInput
                        style={[styles.textInput, customStyles.descriptionInput]} 
                        placeholder="Description (optional)"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        numberOfLines={4}
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
                            value={selectedExpiryTime || temporaryExpiryTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                if (event.type === "set") {
                                    setSelectedExpiryTime(selectedDate || temporaryExpiryTime);
                                }
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
                                        description,  
                                        temporaryExpiryTime: expiryTimeToUse,
                                    };

                                    handleAddSession(sessionData);
                                    setModalVisible(false);
                                    setNewSessionName('');
                                    setDescription('');
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
                                setDescription('');
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


const customStyles = StyleSheet.create({
    suggestionsList: {
        backgroundColor: '#ffffff',
        maxHeight: 150,
        borderRadius: 0,
        marginTop: -10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ffffff'
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    suggestionText: {
        fontSize: 16,
        color: '#333',
    },
    descriptionInput: {
        textAlignVertical: 'center', 
        height: 40,                  
        paddingVertical: 10,          
        fontSize: 16,                
    },
});

export default AddSessionModal;