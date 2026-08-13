import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import LoginNavigate from "./Pages/Login";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { userAtom } from "./Pages/Login/store/userAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import MainPage from "./Pages/Main";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingComponent from "./Base/LoadingComponent/LoadingComponent";
import { loadingStore } from "./Store/loadingStore";
import QualityControlNavigate from "./Pages/QualityControl";

const AppNaivgate = () => {
  const Stack = createNativeStackNavigator();
  const [userToken, setUserToken] = useRecoilState(userAtom);
  const [user, setUser] = useState();
  useEffect(() => {
    let isMounted = true;
    console.log("userToken: ", userToken);
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("storeUserData");
        if (isMounted) {
          if (jsonValue) {
            console.log("JSON.parse(jsonValue): ", JSON.parse(jsonValue));
            setUserToken(JSON.parse(jsonValue));
          }
        }
      } catch (e) {
        // error reading value
        console.log("e: ", e);
      }
    };
    getData();
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run effect only once
  const loadingAtom = useRecoilValue(loadingStore);
  return (
    <View className="w-full h-full">
      <LoadingComponent open={loadingAtom} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken?.tokenID && userToken.tokenID !== null ? (
            <>
              <Stack.Screen name="Main" component={MainPage} />
              <Stack.Screen
                name="QualityControlNavigate"
                component={QualityControlNavigate}
              />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginNavigate} />
            // <Stack.Screen name="Main" component={MainPage} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};
export default AppNaivgate;
