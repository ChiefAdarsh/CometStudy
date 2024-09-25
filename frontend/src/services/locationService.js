import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('Permission to access location was denied.');
    }
};

export const getCurrentLocation = async () => {
    return await Location.getCurrentPositionAsync({});
};

export const watchLocationChanges = async (onLocationChange) => {
    return await Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
        },
        onLocationChange
    );
};

export const watchHeadingChanges = async (onHeadingChange) => {
    return await Location.watchHeadingAsync(onHeadingChange);
};