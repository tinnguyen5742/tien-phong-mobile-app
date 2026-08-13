import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QualityControlList from "./list";
import QualityControlDetail from "./detail";

const Stack = createNativeStackNavigator();

const QualityControlNavigate = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="QualityControlList" component={QualityControlList} />
      <Stack.Screen
        name="DetailQualityControl"
        component={QualityControlDetail}
      />
      {/* <Stack.Screen name="ViewQualityControl" component={ViewQualityControl} /> */}
    </Stack.Navigator>
  );
};

export default QualityControlNavigate;
