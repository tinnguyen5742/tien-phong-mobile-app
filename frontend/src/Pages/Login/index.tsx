import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { useSetRecoilState } from "recoil";
import Toast from "react-native-toast-message";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBuilding,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-regular-svg-icons";
import { faUser, faLock, faHome } from "@fortawesome/free-solid-svg-icons";

import { loadingStore } from "../../Store/loadingStore";
import { userAtom } from "./store/userAtom";
import { storeUserData } from "./store/asyncUserStorage";
import { login } from "../../Base/api/api_service";
import { request } from "react-native-permissions";
import { jwtDecode } from "jwt-decode";
import base64 from "base-64";
import CompanyModal from "./Modal/CompanyModal";

const LoginNavigate = () => {
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setUserStore = useSetRecoilState(userAtom);
  const [companyTypeModal, setCompanyTypeModal] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    tenant: "",
  });

  const handleInputChange = (fieldName: string, text: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: text }));
  };

  const handleCompayTypeModal = () => {
    setCompanyTypeModal(!companyTypeModal);
  };

  const handleChangeTypeCompany = (value: string) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      tenant: value,
    }));
  };

  const decodeJWT = (token: string) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Token không đúng định dạng JWT");
      }
      const payload = parts[1]; // Lấy phần thân chứa dữ liệu của user
      const decoded = base64.decode(payload); // Giải mã chuỗi Base64 bằng thư viện an toàn
      return JSON.parse(decoded);
    } catch (error) {
      console.error("❌ Lỗi giải mã JWT:", error);
      return null;
    }
  };

  const submit = async () => {
    if (!formValues.username?.trim() || !formValues.password) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập đầy đủ tài khoản và mật khẩu",
      });
      return;
    }

    setLoadingAtom(true);

    try {
      const body = {
        Username: formValues.username.trim(),
        Password: formValues.password,
        Tenant: formValues.tenant,
        // Username: "admin",
        // Password: "6789@6789",
        // Tenant: "TIENPHONGNAM",
      };

      const result = await login(body);

      // 1. Kiểm tra dựa trên property 'Success' mới
      if (result.Success) {
        const accessToken = result.AccessToken;
        const userInfo = result.User; // Dữ liệu User từ API mới

        // Vẫn dùng decodeJWT để lấy Roles/Function nếu API không trả về ở object User
        const decoded = decodeJWT(accessToken);
        console.log("🚀 Giải mã JWT: ", decoded);

        // 2. Lưu trữ thông tin
        await storeUserData({
          tokenID: accessToken,
          refreshToken: result.RefreshToken, // Lưu thêm RefreshToken
          roles: decoded?.Function || [], // Lấy từ JWT hoặc để trống
          nameID: userInfo.Username, // Mapping từ result.User
          displayName: userInfo.DisplayName,
          company: userInfo.Company,
        });

        setUserStore({
          tokenID: accessToken,
          roles: decoded?.Function || [],
          nameID: userInfo.Username,
        });

        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Chào mừng ${userInfo.DisplayName || "bạn"} quay trở lại`,
        });

        // Điều hướng tới Dashboard tại đây
        // navigation.navigate('MainTab');
      } else {
        // Trường hợp API trả về Success: false
        Toast.show({
          type: "error",
          text1: "Đăng nhập thất bại",
          text2: result.Message || "Sai tài khoản hoặc mật khẩu",
        });
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập tại Page:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi hệ thống",
        text2: error.message || "Đã có lỗi xảy ra, vui lòng thử lại",
      });
    } finally {
      setLoadingAtom(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-8 py-12"
      >
        {/* Header Section */}
        <View className="items-center mb-12">
          <View className="h-32 justify-center items-center">
            <Image
              source={require("../../Assets/imgs/logo.jpg")}
              className="h-24"
              resizeMode="contain"
            />
          </View>
          <Text className="text-slate-400 mt-2 font-medium">
            Đăng nhập để tiếp tục quản lý
          </Text>
        </View>

        {/* Form Section */}
        <View className="space-y-4">
          {/* Username Input */}
          <View className="relative">
            <View className="absolute left-4 top-[18px] z-10">
              <FontAwesomeIcon icon={faUser} color="#94a3b8" size={18} />
            </View>
            <TextInput
              placeholder="Tài khoản"
              placeholderTextColor="#94a3b8"
              value={formValues.username}
              autoCapitalize="none"
              onChangeText={(text) => handleInputChange("username", text)}
              className="bg-white h-14 pl-12 pr-4 rounded-2xl border border-slate-100 text-slate-700 shadow-sm shadow-slate-200 font-medium"
            />
          </View>

          {/* Password Input */}
          <View className="relative">
            <View className="absolute left-4 top-[18px] z-10">
              <FontAwesomeIcon icon={faLock} color="#94a3b8" size={18} />
            </View>
            <TextInput
              placeholder="Mật khẩu"
              placeholderTextColor="#94a3b8"
              value={formValues.password}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              onChangeText={(text) => handleInputChange("password", text)}
              className="bg-white h-14 pl-12 pr-12 rounded-2xl border border-slate-100 text-slate-700 shadow-sm shadow-slate-200 font-medium"
            />
            <Pressable
              onPress={() => setShowPass(!showPass)}
              className="absolute right-4 top-[18px]"
            >
              <FontAwesomeIcon
                icon={showPass ? faEyeSlash : faEye}
                color="#64748b"
                size={18}
              />
            </Pressable>
          </View>
          <View className="relative">
            <View className="absolute left-4 top-[18px] z-10">
              <FontAwesomeIcon icon={faBuilding} color="#94a3b8" size={18} />
            </View>
            <Pressable
              onPress={handleCompayTypeModal}
              className="bg-white h-14 pl-12 pr-12 rounded-2xl border border-slate-100 text-slate-700 shadow-sm shadow-slate-200 font-medium"
            >
              <Text className="top-[18px] text-slate-400 font-medium">
                {!formValues?.tenant ? "Chọn công ty" : formValues.tenant}
              </Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={submit}
            style={({ pressed }) => [
              { transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            className="bg-red-400 h-14 rounded-md items-center justify-center mt-6 shadow-lg shadow-blue-200"
          >
            <Text className="text-white text-lg font-bold">Đăng nhập</Text>
          </Pressable>

          {/* <View className="items-center mt-8">
                        <Text className="text-slate-400 text-xs">© 2026 Duy Nhật Co., Ltd</Text>
                    </View> */}
        </View>
      </KeyboardAvoidingView>

      {companyTypeModal && (
        <CompanyModal
          open={companyTypeModal}
          title="Chọn công ty"
          selectedTenant={formValues.tenant}
          onSelectCompany={(value) => handleChangeTypeCompany(value)}
          onClose={handleCompayTypeModal}
        />
      )}
    </ScrollView>
  );
};

export default LoginNavigate;
