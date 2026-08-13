import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRecoilState } from "recoil";
import { userAtom } from "../Login/store/userAtom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBoxesStacked,
  faWarehouse,
  faBox,
  faToiletPaper,
  faRoute,
  faTruckRampBox,
  faClipboardCheck,
  faCheckDouble,
  faRightFromBracket,
  faGear,
  faTasks,
} from "@fortawesome/free-solid-svg-icons";

const MainPage = () => {
  const navigate = useNavigation();
  const [userStore, setUserStore] = useRecoilState(userAtom);
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      id: 1,
      userRoles: [],
      title: "QA/QC",
      icon: faTasks,
      screen: "QualityControlNavigate",
      color: "#10B981",
    },
    {
      id: 2,
      userRoles: [],
      title: "Cài đặt",
      icon: faGear,
      screen: "Setting",
      color: "#6B7280",
    },
    {
      id: 3,
      userRoles: [],
      title: "Đăng xuất",
      icon: faRightFromBracket,
      screen: "logout",
      color: "#B91C1C",
    },
  ];
  const handlePress = (item: any) => {
    if (item.screen === "logout") {
      handleLogout();
    } else {
      navigate.navigate(item.screen as never);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("storeUSerData");
    setUserStore({ tokenID: null, roles: [], nameID: null });
  };

  return (
    // flex-1: chiếm toàn màn hình, bg-slate-50: nền xám cực nhẹ
    <SafeAreaView
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="flex-1 bg-slate-50"
    >
      <StatusBar barStyle="dark-content" />

      {/* Header: chứa Logo */}
      <View className="h-28 justify-center items-center bg-white shadow-xl">
        <Image
          source={require("../../Assets/imgs/logo.jpg")}
          className="w-6/12 h-24"
          resizeMode="contain"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                            {JSON.stringify(userStore, null, 2)}
                </Text> */}
        {/* Grid System: flex-row và flex-wrap để tự động xuống hàng */}
        <View className="flex-row flex-wrap justify-between">
          {menuItems
            // 🌟 1. LỌC ĐÚNG QUYỀN ĐỂ HIỂN THỊ
            .filter((item) => {
              // Luôn hiển thị các menu không yêu cầu quyền (Cài đặt, Đăng xuất)
              if (item.userRoles.length === 0) return true;

              // 🌟 SỬA TẠI ĐÂY: Ép kiểu "as string[]" để TypeScript hiểu đây là mảng chuỗi
              const userRolesList = (userStore?.roles || []) as string[];

              if (userRolesList.length === 0) return false;

              // Bỏ gạch đỏ: Lúc này requiredRole (string) check trong mảng string[] hoàn toàn hợp lệ
              return item.userRoles.some((requiredRole) =>
                userRolesList.includes(requiredRole),
              );
            })
            // 🌟 2. RENDER THEO DANH SÁCH ĐÃ LỌC
            .map((item) => {
              return (
                <Pressable
                  key={item.id}
                  // 🌟 TRUYỀN CSS INLINE ĐIỀU KIỆN TẠI ĐÂY
                  className="w-[48%] bg-white rounded-3xl p-6 mb-4 items-center justify-center shadow-md shadow-slate-300}"
                  onPress={() => handlePress(item)}
                  style={({ pressed }) => [
                    pressed
                      ? { transform: [{ scale: 0.95 }], opacity: 0.8 }
                      : {},
                  ]}
                >
                  {/* Icon Wrapper */}
                  <View
                    style={{ backgroundColor: `${item.color}15` }}
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      color={item.color}
                      size={28}
                    />
                  </View>

                  <Text
                    className="text-slate-800 font-bold text-center text-[16px] h-[45px] leading-[22px]"
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainPage;
