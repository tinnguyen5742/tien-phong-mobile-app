import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import LoginNavigate from './Pages/Login';
import InventoryNavigate from './Pages/Inventory';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {userAtom} from './Pages/Login/store/userAtom';
import {useRecoilState, useRecoilValue} from 'recoil';
import MainPage from './Pages/Main';
import WareHousePage from './Pages/WareHouse';
import {View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingComponent from './Base/LoadingComponent/LoadingComponent';
import {loadingStore} from './Store/loadingStore';
import ProduceNavigate from './Pages/Produce';
import SubProduceNavigate from './Pages/Produce/subMenu';
import ChangeLocationInWarehouseNavigate from './Pages/ChangeLocationInWarehouse';
import SettingPage from './Pages/Setting';
import StockTakeNavigate from './Pages/StockTake';
import QualityControlNavigate from './Pages/QualityControl';
import OutputProduceNavigate from './Pages/Produce/Output/list';
import InputProduceNavigate from './Pages/Produce/Input/list';
import InputDetailProduceNavigate from './Pages/Produce/Input/detail';
import OutputDetailProduceNavigate from './Pages/Produce/Output/detail';
import MachineSettingNavigate from './Pages/MachineSettings';
import BlowingSettingsList from './Pages/MachineSettings/BlowingSettings/list';
import BlowingSettingsDetail from './Pages/MachineSettings/BlowingSettings/detail';
import BlowingMachineInfo from './Pages/MachineSettings/BlowingSettings/machineInfo';
import PrintingSettingsList from './Pages/MachineSettings/PrintingSettings/list';
import PrintingSettingsDetail from './Pages/MachineSettings/PrintingSettings/detail';
import PrintingMachineInfo from './Pages/MachineSettings/PrintingSettings/machineInfo';
import LaminatingSettingsList from './Pages/MachineSettings/LaminatingSettings/list';
import LaminatingSettingsDetail from './Pages/MachineSettings/LaminatingSettings/detail';
import CuttingSettingsList from './Pages/MachineSettings/CuttingSettings/list';
import CuttingSettingsDetail from './Pages/MachineSettings/CuttingSettings/detail';
import BagMakingSettingsList from './Pages/MachineSettings/BagMakingSettings/list';
import BagMakingSettingsDetail from './Pages/MachineSettings/BagMakingSettings/detail';
import SlittingSettingsList from './Pages/MachineSettings/SlittingSettings/list';
import SlittingSettingsDetail from './Pages/MachineSettings/SlittingSettings/detail';
import InspectionSettingsList from './Pages/MachineSettings/InspectionSettings/list';
import InspectionSettingsDetail from './Pages/MachineSettings/InspectionSettings/detail';
import LaminatingMachineInfo from './Pages/MachineSettings/LaminatingSettings/machineInfo';
import CuttingMachineInfo from './Pages/MachineSettings/CuttingSettings/machineInfo';
import BagMakingMachineInfo from './Pages/MachineSettings/BagMakingSettings/machineInfo';
import SlittingMachineInfo from './Pages/MachineSettings/SlittingSettings/machineInfo';
import InspectionMachineInfo from './Pages/MachineSettings/InspectionSettings/machineInfo';
import OutputDetail2ProduceNavigate from './Pages/Produce/Output/detail2';
import OutputDetail3ProduceNavigate from './Pages/Produce/Output/detail3';
// import { logoutStore } from "./Store/logoutModalStore";
// import { DetailProduct } from "./Pages/DetailProduct/DetailProduct";
// import BoxInfoNavigate from "./Pages/BoxInfo";
// import NhapCuonNavigate from "./Pages/NhapCuon";
// import XuatCuonNavigate from "./Pages/XuatCuon";

const AppNaivgate = () => {
  const Stack = createNativeStackNavigator();
  const [userToken, setUserToken] = useRecoilState(userAtom);
  // const [user, setUser] = useState();
  useEffect(() => {
    let isMounted = true;
    console.log('userToken: ', userToken);
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('storeUSerData');
        if (isMounted) {
          if (jsonValue) {
            console.log('JSON.parse(jsonValue): ', JSON.parse(jsonValue));
            setUserToken(JSON.parse(jsonValue));
          }
        }
      } catch (e) {
        // error reading value
        console.log('e: ', e);
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
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {userToken?.tokenID && userToken.tokenID !== null ? (
            <>
              <Stack.Screen name="Main" component={MainPage} />
              <Stack.Screen name="Produce" component={ProduceNavigate} />
              <Stack.Screen
                name="InputProduce"
                component={InputProduceNavigate}
              />
              <Stack.Screen
                name="OutputProduce"
                component={OutputProduceNavigate}
              />
              <Stack.Screen
                name="SubMenuProduce"
                component={SubProduceNavigate}
              />
              <Stack.Screen name="Inventory" component={InventoryNavigate} />
              <Stack.Screen name="WareHouse" component={WareHousePage} />
              <Stack.Screen
                name="InputDetailProduce"
                component={InputDetailProduceNavigate}
              />
              <Stack.Screen
                name="OutputDetailProduce"
                component={OutputDetailProduceNavigate}
              />
              <Stack.Screen
                name="OutputDetail2Produce"
                component={OutputDetail2ProduceNavigate}
              />
              <Stack.Screen
                name="OutputDetail3Produce"
                component={OutputDetail3ProduceNavigate}
              />
              <Stack.Screen
                name="ChangeLocationInWarehouse"
                component={ChangeLocationInWarehouseNavigate}
              />
              <Stack.Screen name="Setting" component={SettingPage} />
              <Stack.Screen
                name="StockTakeNavigate"
                component={StockTakeNavigate}
              />
              <Stack.Screen
                name="QualityControlNavigate"
                component={QualityControlNavigate}
              />
              <Stack.Screen
                name="MachineSettingNavigate"
                component={MachineSettingNavigate}
              />
              <Stack.Screen
                name="BlowingSettingsList"
                component={BlowingSettingsList}
              />
              <Stack.Screen
                name="BlowingSettingsDetail"
                component={BlowingSettingsDetail}
              />
              <Stack.Screen
                name="BlowingMachineInfo"
                component={BlowingMachineInfo}
              />
              <Stack.Screen
                name="PrintingSettingsList"
                component={PrintingSettingsList}
              />
              <Stack.Screen
                name="PrintingSettingsDetail"
                component={PrintingSettingsDetail}
              />
              <Stack.Screen
                name="PrintingMachineInfo"
                component={PrintingMachineInfo}
              />
              <Stack.Screen
                name="LaminatingSettingsList"
                component={LaminatingSettingsList}
              />
              <Stack.Screen
                name="LaminatingSettingsDetail"
                component={LaminatingSettingsDetail}
              />
              <Stack.Screen
                name="LaminatingMachineInfo"
                component={LaminatingMachineInfo}
              />
              <Stack.Screen
                name="CuttingSettingsList"
                component={CuttingSettingsList}
              />
              <Stack.Screen
                name="CuttingSettingsDetail"
                component={CuttingSettingsDetail}
              />
              <Stack.Screen
                name="CuttingMachineInfo"
                component={CuttingMachineInfo}
              />
              <Stack.Screen
                name="BagMakingSettingsList"
                component={BagMakingSettingsList}
              />
              <Stack.Screen
                name="BagMakingSettingsDetail"
                component={BagMakingSettingsDetail}
              />
              <Stack.Screen
                name="BagMakingMachineInfo"
                component={BagMakingMachineInfo}
              />
              <Stack.Screen
                name="SlittingSettingsList"
                component={SlittingSettingsList}
              />
              <Stack.Screen
                name="SlittingSettingsDetail"
                component={SlittingSettingsDetail}
              />
              <Stack.Screen
                name="SlittingMachineInfo"
                component={SlittingMachineInfo}
              />
              <Stack.Screen
                name="InspectionSettingsList"
                component={InspectionSettingsList}
              />
              <Stack.Screen
                name="InspectionSettingsDetail"
                component={InspectionSettingsDetail}
              />
              <Stack.Screen
                name="InspectionMachineInfo"
                component={InspectionMachineInfo}
              />
              {/* <Stack.Screen name="DetailProduct" component={DetailProduct} />
                                    <Stack.Screen name="BoxInfoNavigate" component={BoxInfoNavigate} />
                                    <Stack.Screen name="XuatCuonNavigate" component={XuatCuonNavigate} />
                                    <Stack.Screen name="NhapCuonNavigate" component={NhapCuonNavigate} /> */}
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginNavigate} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};
export default AppNaivgate;
