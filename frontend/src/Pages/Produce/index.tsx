import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import ListProduce from "./list/ListProduce";
// import DetailProduce from "./detai/detail";
import subMenu from "./subMenu";

const Stack = createNativeStackNavigator();
const ProduceNavigate = () => {
    return (
        // <View>
        //     <Text>inventory navigate</Text>
        // </View>
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            {/* <Stack.Screen name="ListProdcue" component={ListProduce} />
            <Stack.Screen name="DetailProduce" component={DetailProduce} /> */}
            <Stack.Screen name="subMenu" component={subMenu} />
        </Stack.Navigator>
    );
};
export default ProduceNavigate;