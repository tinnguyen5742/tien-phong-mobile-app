import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StockTakeList from "./list";
import StockTakeDetail from "./detail";

const Stack = createNativeStackNavigator();

const StockTakeNavigate = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="StockTakeList" component={StockTakeList} />
            <Stack.Screen name="StockTakeDetail" component={StockTakeDetail} />
        </Stack.Navigator>
    );
};

export default StockTakeNavigate;