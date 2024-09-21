// src/components/PlacesSearch.js

import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const PlacesSearch = ({ GOOGLE_API_KEY, onLocationSelect }) => {
    return (
        <GooglePlacesAutocomplete
            placeholder="Search for a place within UTD"
            minLength={2}
            fetchDetails={true}
            onPress={onLocationSelect}
            query={{
                key: GOOGLE_API_KEY,
                language: 'en',
                location: `${32.9867},${-96.7505}`, // UTD campus location
                radius: 1000, // 1 km radius around UTD
            }}
            styles={{
                container: {
                    position: 'absolute',
                    top: 80,
                    width: '90%',
                    alignSelf: 'center',
                    zIndex: 1,
                },
                textInput: {
                    height: 40,
                    backgroundColor: 'white',
                    paddingHorizontal: 10,
                    borderRadius: 5,
                    elevation: 2,
                },
            }}
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={200}
        />
    );
};

export default PlacesSearch;