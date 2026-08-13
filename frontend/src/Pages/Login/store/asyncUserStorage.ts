import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserData = async (value: object) => {
    console.log('userData: ', value);
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem('storeUSerData', jsonValue);
    } catch (e) {
        // saving error
        console.log('e: ', e);
    }
};

export const storeIpPrinter = async (value: any) => {
    console.log('ipPrinterLocal: ', value);
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem('ipPrinterLocal', jsonValue);
    } catch (e) {
        // saving error
        console.log('e: ', e);
    }
};

const STORAGE_KEY = "useCameraScanSetting";

// 🔹 Lưu giá trị cài đặt (true / false)
export const storeSettingValue = async (value: boolean) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        console.log("💾 Đã lưu cài đặt:", value);
    } catch (e) {
        console.log("❌ Lỗi lưu cài đặt:", e);
    }
};

// 🔹 Lấy giá trị cài đặt (nếu chưa có thì trả false)
export const getSettingValue = async (): Promise<boolean> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue !== null) {
            return JSON.parse(jsonValue);
        }
    } catch (e) {
        console.log("❌ Lỗi đọc cài đặt:", e);
    }
    return false; // mặc định dùng thiết bị quét
};
