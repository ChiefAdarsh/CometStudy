// src/navigation/MainStackNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignupScreen from '../screens/SignupScreen';
import ActiveSessionScreen from '../screens/ActiveSessionScreen'; // Import the ActiveSessionScreen

const Stack = createStackNavigator();
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
                    } else if (route.name === 'ActiveSession') {
                        iconName = 'information-circle';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ title: 'Active Session' }} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

const MainStackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainApp" component={TabNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default MainStackNavigator;