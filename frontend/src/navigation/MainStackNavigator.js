import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Import Bottom Tab Navigator
import { Ionicons } from '@expo/vector-icons'; // Icons for the bottom tabs

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Stack navigator for the home/login screen
const Stack = createStackNavigator();

// Tab navigator for the map and settings screens
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Map"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Map') {
                        iconName = 'map';
                    } else if (route.name === 'Settings') {
                        iconName = 'settings';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false, // Hide headers for the tab screens
            })}
        >
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

const MainStackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }} // Hide header for HomeScreen
            />
            <Stack.Screen
                name="MainApp" // The main app screen with the tab navigator
                component={TabNavigator}
                options={{ headerShown: false }} // Hide header for the tab screens
            />
        </Stack.Navigator>
    );
};

export default MainStackNavigator;