import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NhapCuon from "./NhapCuon";
import ListNhapCuon from "./List/ListNhapCuon";

const Stack = createNativeStackNavigator();
const NhapCuonNavigate = () => {
    return (
        // <View>
        //     <Text>inventory navigate</Text>
        // </View>
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="ListNhapCuon" component={ListNhapCuon} />
            <Stack.Screen name="NhapCuon" component={NhapCuon} />
            {/* <Stack.Screen name="DetailInventory" component={DetailInventory} /> */}
        </Stack.Navigator>
    );
};
export default NhapCuonNavigate;