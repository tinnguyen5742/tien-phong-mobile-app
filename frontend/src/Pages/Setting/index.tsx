import React, { useEffect } from "react";
import { View, Text, Switch } from "react-native";
import { useRecoilState } from "recoil";
import { settingStore } from "../../Store/settingStore";
import { CustomColor } from "../../ults";
import HeaderComponent from "../../Base/HeaderComponent/headerComponent";
import { useNavigation } from "@react-navigation/native";
import {
  getSettingValue,
  storeSettingValue,
} from "../Login/store/asyncUserStorage";
import { AppColors } from "../../../colors";

const SettingPage = () => {
  const [settings, setSettings] = useRecoilState(settingStore);
  const navigation = useNavigation();

  // ✅ Load từ thiết bị khi mở trang
  useEffect(() => {
    const loadSetting = async () => {
      const value = await getSettingValue();
      setSettings({ useCameraScan: value });
    };
    loadSetting();
  }, []);

  // ✅ Khi đổi switch → cập nhật store + lưu vào thiết bị
  const toggleScanMode = async () => {
    const newValue = !settings.useCameraScan;
    setSettings({ useCameraScan: newValue });
    await storeSettingValue(newValue);
  };

  const handleBack = () => navigation.goBack();

  return (
    // flex-1 bg-white thay thế cho locationInWarehouseDetailStyle.inventory
    <View className="flex-1 bg-slate-50">
      <HeaderComponent
        backButton={true}
        handleBack={handleBack}
        title="Cài đặt chế độ quét"
        iconRight={<View />}
      />

      {/* Container Card dùng Tailwind classes */}
      <View className="m-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <View className="flex-row justify-between items-center py-2">
          <View className="flex-1 pr-4">
            <Text className="text-base font-semibold text-slate-800">
              Chế độ quét hiện tại
            </Text>
            {/* <Text className="text-sm text-slate-500 mt-1">
                            {settings.useCameraScan
                                ? "Sử dụng Camera trực tiếp trên điện thoại"
                                : "Sử dụng súng quét hoặc thiết bị ngoại vi"}
                        </Text> */}
          </View>

          <Switch
            value={settings.useCameraScan}
            onValueChange={toggleScanMode}
            trackColor={{
              false: "#cbd5e1",
              true: AppColors.primary,
            }}
            thumbColor={settings.useCameraScan ? "#fff" : "#f4f3f4"}
          />
        </View>

        {/* Status Badge để người dùng dễ nhận biết */}
        {/* <View className={`mt-4 py-2 px-4 rounded-lg items-center ${settings.useCameraScan ? 'bg-blue-50' : 'bg-slate-100'}`}>
                    <Text className={`font-bold ${settings.useCameraScan ? 'text-blue-700' : 'text-slate-600'}`}>
                        {settings.useCameraScan ? "CAMERA MODE" : "HARDWARE MODE"}
                    </Text>
                </View> */}
      </View>

      {/* <View className="px-6">
                <Text className="text-xs text-slate-400 text-center">
                    Lưu ý: Chế độ Camera sẽ yêu cầu quyền truy cập máy ảnh. Chế độ thiết bị yêu cầu kết nối OTG hoặc Bluetooth.
                </Text>
            </View> */}
    </View>
  );
};

export default SettingPage;
