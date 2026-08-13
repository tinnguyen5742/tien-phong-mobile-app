import React from "react";
import { View, Text } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import BlowingSettingsList from "./BlowingSettings/list";
// import BlowingSettingsDetail from "./BlowingSettings/detail";
import subMenu from "./subMenu";

const Stack = createNativeStackNavigator();
const MachineSettingNavigate = () => {
    return (
        // <View>
        //     <Text>inventory navigate</Text>
        // </View>
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            {/* <Stack.Screen name="BlowingSettingsList" component={BlowingSettingsList} />
            <Stack.Screen name="BlowingSettingsDetail" component={BlowingSettingsDetail} /> */}
            <Stack.Screen name="subMenu" component={subMenu} />
        </Stack.Navigator>
    );
};
export default MachineSettingNavigate;