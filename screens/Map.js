import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Alert, Button } from 'react-native';
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
        const query = address || addr; // use route param first, fallback to input

        if (!query) {
            Alert.alert("No address provided");
            return;
        }

        fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    const newLat = parseFloat(lat);
                    const newLon = parseFloat(lon);

                    setLat(newLat);
                    setLon(newLon);

                    mapRef.current?.animateToRegion({
                        latitude: newLat,
                        longitude: newLon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 1000);
                } else {
                    Alert.alert("No results found for the provided address");
                }
            })
            .catch(err => console.error("Fetch error:", err));
    };


    return (
        <SafeAreaProvider>
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

                <Button
                    title="Show"
                    onPress={handleFetch}
                />
                <StatusBar style="auto" />
            </SafeAreaView>
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
});