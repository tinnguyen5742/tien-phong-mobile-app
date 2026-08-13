import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BoxDetail from "./detail/BoxDetail";
import ListBoxInfo from "./list/BoxInfoList";

const Stack = createNativeStackNavigator();

const BoxInfoNavigate = () => {

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="BoxInfoList" component={ListBoxInfo} />
            <Stack.Screen name="BoxInfoDetail" component={BoxDetail} />
        </Stack.Navigator>
    );
};
export default BoxInfoNavigate;