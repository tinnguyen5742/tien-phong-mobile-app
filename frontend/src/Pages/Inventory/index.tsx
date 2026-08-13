import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListInventory from "./list";

const Stack = createNativeStackNavigator();
const InventoryNavigate = () => {
    return (
        // <View>
        //     <Text>inventory navigate</Text>
        // </View>
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="ListInventory" component={ListInventory} />
            {/* <Stack.Screen name="DetailInventory" component={DetailInventory} /> */}
        </Stack.Navigator>
    );
};
export default InventoryNavigate;