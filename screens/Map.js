import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { API_KEY } from '@env';
import * as Location from 'expo-location';

export default function App({ route }) {
    const [addr, setAddr] = useState("");
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");

    const [location, setLocation] = useState(null);

    const mapRef = useRef(null);

    const { address } = route.params;

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('No permission to get location')
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            const { latitude, longitude } = location.coords;

            // Set initial marker
            setLat(latitude);
            setLon(longitude);

            // Move the map to user location with the deltas
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            }
        })();
    }, []);

    const handleFetch = () => {
        Keyboard.dismiss();

        fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(addr)}&api_key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const first = data[0];
                    const newLat = parseFloat(first.lat);
                    const newLon = parseFloat(first.lon);

                    setLat(newLat);
                    setLon(newLon);
                    setAddr("");

                    mapRef.current.animateToRegion({
                        latitude: newLat,
                        longitude: newLon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000); // duration in ms
                } else {
                    console.log("No results found");
                }
            })
            .catch(err => console.error("Fetch error:", err));
    }

    return (
        <SafeAreaProvider>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView style={styles.container}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                    >
                        {lat && lon &&
                            <Marker
                                coordinate={{
                                    latitude: lat,
                                    longitude: lon
                                }}
                            />}

                    </MapView>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.searchContainer}
                    >
                        <Button
                            title="Show"
                            value={address}
                            onPress={handleFetch}
                        />
                    </KeyboardAvoidingView>
                    <StatusBar style="auto" />
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    searchContainer: {
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },

    textInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
});