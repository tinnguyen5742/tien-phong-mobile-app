import React, { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useSetRecoilState } from "recoil";
import Toast from "react-native-toast-message";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

import { loadingStore } from "../../Store/loadingStore";
import { userAtom } from "./store/userAtom";
import { storeUserData } from "./store/asyncUserStorage";
import { login } from "../../Base/api/api_service";
import { request } from 'react-native-permissions';
import { jwtDecode } from 'jwt-decode';
import base64 from 'base-64';

const LoginNavigate = () => {
    const setLoadingAtom = useSetRecoilState(loadingStore);
    const setUserStore = useSetRecoilState(userAtom);

    const [showPass, setShowPass] = useState(false);
    const [formValues, setFormValues] = useState({ username: '', password: '' });

    const handleInputChange = (fieldName: string, text: string) => {
        setFormValues(prev => ({ ...prev, [fieldName]: text }));
    };

    // const submit = async () => {
    //     if (!formValues.username) {
    //         Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin' });
    //         return;
    //     }

    //     const dataSubmit = {
    //         MaNguoiSD: formValues.username,
    //         MatKhau: formValues.password,
    //     };
    //     console.log("api_url:", api_url);
    //     console.log("dataSubmit:", dataSubmit);

    //     // setLoadingAtom(true);
    //     try {
    //         const response = await axios.post(`${api_url}/user/login`, dataSubmit, {
    //             headers: { 'Content-Type': 'application/json' },
    //         });
    //         console.log(response);

    //         if (response.data.status) {
    //             const token = response.data.data;
    //             await storeUserData({ tokenID: token });
    //             setUserStore({ tokenID: token });

    //             Toast.show({ type: 'success', text1: 'Thành công', text2: 'Chào mừng bạn quay trở lại' });
    //         } else {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Thất bại',
    //                 text2: response.data.Message || 'Sai tài khoản hoặc mật khẩu'
    //             });
    //         }
    //     } catch (error) {
    //         console.log("error:", error);
    //         Toast.show({ type: 'error', text1: 'Lỗi hệ thống', text2: 'Không thể kết nối đến máy chủ' });
    //     } finally {
    //         setLoadingAtom(false);
    //     }
    // };

    const decodeJWT = (token: string) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token không đúng định dạng JWT');
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
        // 1. Kiểm tra dữ liệu đầu vào phía Client
        if (!formValues.username?.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Thiếu thông tin',
                text2: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu'
            });
            return;
        }

        setLoadingAtom(true);

        try {
            const body = {
                MaNguoiSD: formValues.username.trim(),
                MatKhau: formValues.password,
            };

            // Đút nguyên object body vào hàm login
            const result = await login(body);

            // 3. Xử lý logic nghiệp vụ sau khi có kết quả trả về thành công
            if (result.status) {
                const token = result.data;
                // console.log("token: ",token)
                const decoded = decodeJWT(token);
                console.log("🚀 Giải mã JWT thành công: ", decoded);

                // Lưu trữ Token vào Storage và Global State của bạn
                await storeUserData({ tokenID: token, roles: decoded.Function, nameID: decoded.nameid });
                setUserStore({ tokenID: token, roles: decoded.Function, nameID: decoded.nameid });

                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Chào mừng bạn quay trở lại'
                });
                
                // Tiến hành chuyển trang (navigate) tới Dashboard tại đây nếu cần
            } else {
                // Trường hợp Server trả về status: false (Sai mật khẩu/Tài khoản không tồn tại)
                Toast.show({
                    type: 'error',
                    text1: 'Thất bại',
                    text2: result.Message || 'Sai tài khoản hoặc mật khẩu'
                });
            }

        } catch (error: any) {
            // 4. Bắt toàn bộ lỗi hệ thống hoặc lỗi kết nối được quăng ra từ api_service
            console.error("Lỗi đăng nhập tại Page:", error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.message || "Đã có lỗi xảy ra vui lòng thử lại"
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
                    <Text className="text-3xl font-black text-slate-800 tracking-tight">Duy Nhật</Text>
                    <Text className="text-slate-400 mt-2 font-medium">Đăng nhập để tiếp tục quản lý</Text>
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
                            onChangeText={(text) => handleInputChange('username', text)}
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
                            onChangeText={(text) => handleInputChange('password', text)}
                            className="bg-white h-14 pl-12 pr-12 rounded-2xl border border-slate-100 text-slate-700 shadow-sm shadow-slate-200 font-medium"
                        />
                        <Pressable
                            onPress={() => setShowPass(!showPass)}
                            className="absolute right-4 top-[18px]"
                        >
                            <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} color="#64748b" size={18} />
                        </Pressable>
                    </View>

                    {/* Submit Button */}
                    <Pressable
                        onPress={submit}
                        style={({ pressed }) => [
                            { transform: [{ scale: pressed ? 0.98 : 1 }] }
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
        </ScrollView>
    );
};

export default LoginNavigate;