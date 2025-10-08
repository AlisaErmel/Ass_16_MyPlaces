import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text } from "react-native";

export default function Map() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text>This is Map screen!</Text>
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