import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListXuaCuon from "./List/ListXuatCuon";
import XuatCuonDetail from "./Detail/DetailXuatCuon";

const Stack = createNativeStackNavigator();
const XuatCuonNavigate = () => {
    return (
        // <View>
        //     <Text>inventory navigate</Text>
        // </View>
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="ListXuatCuon" component={ListXuaCuon} />
            <Stack.Screen name="XuatCuonDetail" component={XuatCuonDetail} />
        </Stack.Navigator>
    );
};
export default XuatCuonNavigate;