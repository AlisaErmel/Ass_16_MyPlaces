import { useState, useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TextInput, TouchableOpacity, FlatList, View, Text } from "react-native";
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
                    id: key,
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
            push(ref(db, 'addresses/'), { address });
            setAddress("");
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {/* Input + Save button */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type in address..."
                        value={address}
                        onChangeText={text => setAddress(text)}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {/* FlatList */}
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.itemText}>{item.address}</Text>
                            <TouchableOpacity
                                style={styles.mapButton}
                                onPress={() => navigation.navigate('Map', { address: item.address })}
                            >
                                <Text style={styles.mapButtonText}>Show on Map</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    itemText: {
        fontSize: 16,
        flex: 1,
    },
    mapButton: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    mapButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
