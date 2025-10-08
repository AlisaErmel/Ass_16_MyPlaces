import { useState, useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TextInput, Button, FlatList, View, Text } from "react-native";
import { ref, push, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';

export default function MyPlaces({ navigation }) {
    const [address, setAddress] = useState("");
    const [items, setItems] = useState([]);

    useEffect(() => {
        const itemsRef = ref(db, "/addresses");
        const unsubscribe = onValue(itemsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formattedItems = Object.keys(data).map(key => ({
                    id: key,       // store Firebase key
                    ...data[key],
                }));
                setItems(formattedItems);
            } else {
                setItems([]);
            }
        });

        return () => unsubscribe();
    }, []);


    const handleSave = () => {
        if (address.trim() !== "") {
            push(ref(db, 'addresses/'), { address }); // store as object
            setAddress("");
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <TextInput
                    placeholder="Type in address..."
                    value={address}
                    onChangeText={text => setAddress(text)}
                />
                <Button
                    title="Save"
                    onPress={handleSave}
                />
                <FlatList
                    data={items}
                    renderItem={({ item }) =>
                        <View style={{ flexDirection: 'row' }}>
                            <Text>{item.address}</Text>
                            <View>
                                <Button
                                    onPress={() => navigation.navigate('Map', { address: item.address })}
                                    title="show on map" />
                            </View>
                        </View>
                    }
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
})