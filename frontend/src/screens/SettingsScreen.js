import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {

    const handleSignOut = async () => {
        try {
            await AsyncStorage.removeItem('token');
            Alert.alert('Signed Out', 'You have been signed out.');

            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.optionList}>
                <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle-outline" size={30} color="#007AFF" />
                    <Text style={styles.optionText}>Profile</Text>
                    <Ionicons name="chevron-forward-outline" size={24} color="#C7C7C7" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={30} color="#007AFF" />
                    <Text style={styles.optionText}>Notifications</Text>
                    <Ionicons name="chevron-forward-outline" size={24} color="#C7C7C7" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Privacy')}>
                    <Ionicons name="lock-closed-outline" size={30} color="#007AFF" />
                    <Text style={styles.optionText}>Privacy</Text>
                    <Ionicons name="chevron-forward-outline" size={24} color="#C7C7C7" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Help')}>
                    <Ionicons name="help-circle-outline" size={30} color="#007AFF" />
                    <Text style={styles.optionText}>Help & Support</Text>
                    <Ionicons name="chevron-forward-outline" size={24} color="#C7C7C7" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={28} color="#FFF" />
                <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        paddingTop: 10,
    },
    optionList: {
        marginVertical: 30,
        paddingHorizontal: 20,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    optionText: {
        fontSize: 18,
        marginLeft: 15,
        flex: 1,
        color: '#333',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 20,
    },
    signOutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});