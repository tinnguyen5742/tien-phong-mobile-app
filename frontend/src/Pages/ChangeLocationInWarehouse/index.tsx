import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { View, Text } from "react-native";
import ChangeLocationInWarehouseDetail from "./detail";
import ChangeLocationInWarehouseList from "./list";

const ChangeLocationInWarehouseNavigate = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="ChangeLocationInWarehouse" component={ChangeLocationInWarehouseList} />
            <Stack.Screen name="ChangeLocationInWarehouseDetail" component={ChangeLocationInWarehouseDetail} />
        </Stack.Navigator>
    );
};
export default ChangeLocationInWarehouseNavigate;