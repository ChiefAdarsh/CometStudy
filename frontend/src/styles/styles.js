// styles/styles.js

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 0.6, // Map takes up 60% of the screen
    },
    addButton: {
        position: 'absolute',
        bottom: 10,
        right: 20,
        zIndex: 2,
    },
    
    topSearchInput: {
        position: 'absolute',
        top: 60,
        width: '90%',
        alignSelf: 'center',
        marginRight: 20,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 5,
        elevation: 2,
        zIndex: 1,
        fontSize: 16,
    },
    addSessionButton: {
        marginLeft: 'auto',  // Pushes the button to the right
        justifyContent: 'center',
    },
    calloutView: {
        width: 200,
        padding: 5,
        flexDirection: 'column',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',  // Align title and button vertically in the center
        justifyContent: 'space-between',  // Ensure the button stays on the right
        width: '100%',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    calloutText: {
        fontSize: 14,
    },
    suggestionsList: {
        maxHeight: 150, // Adjust this value as needed
    },
    expiryTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    timeInputWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    timeInput: {
        height: 40,
        width: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        textAlignVertical: 'center',
        backgroundColor: '#f9f9f9',
        fontSize: 16,
        paddingVertical: 0,
        paddingHorizontal: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
    },
    searchInput: {
        height: 60,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    textInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    studySessionsContainer: {
        flex: 0.4, // Set this to take 40% of the screen
        backgroundColor: '#f7f7f7',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 10,
        zIndex: -1,
    },
    studyTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    studyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    editButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    locationItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    deleteButton: {
        marginRight: 10,
    },
    locationItem: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        elevation: 1,
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
    locationDetails: {
        fontSize: 14,
        color: '#555',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calloutView: {
        width: 200,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    calloutText: {
        fontSize: 14,
    },
    label: {
        fontSize: 16,
        marginRight: 10,
    },
    customHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: '#fff',
        elevation: 3,
    },
});