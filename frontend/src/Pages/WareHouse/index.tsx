import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import React from "react";
import WarehouseDetail from "./detail";
import Warehouse from "./list";

const WarehouseNavigate = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="Warehouse" component={Warehouse} />
            <Stack.Screen name="WarehouseDetail" component={WarehouseDetail} />
        </Stack.Navigator>
    );
};
export default WarehouseNavigate;