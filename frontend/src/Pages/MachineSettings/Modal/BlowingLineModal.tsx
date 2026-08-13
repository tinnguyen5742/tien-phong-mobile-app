import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, TextInput, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { Details2 } from "../BlowingSettings/type";
import { AppColors } from "../../../../colors";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Toast from "react-native-toast-message";

type BlowingLineModalProps = {
    data: Details2;
    handleOpenBlowingLineModal: () => void;
    onSubmit: (data: any) => void;
    open: boolean;
    title: string;
};

const BlowingLineModal = (props: BlowingLineModalProps) => {
    const {
        data,
        handleOpenBlowingLineModal,
        open,
        onSubmit,
    } = props;
    const [dataSubmit, setDataSubmit] = useState<Details2>({} as Details2 );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 🌟 BƯỚC KHÓA LỖI: Nếu modal đang đóng (props.open === false) thì THOÁT NGAY, không chạy logic bên dưới nữa
        if (!props.open || !props.data) return;

        // 🌟 BƯỚC CẮT ĐỨT THAM CHIẾU: Biến rawData thành một bản sao hoàn toàn độc lập, không chung ô nhớ với trang cha
        const rawData = JSON.parse(JSON.stringify(Array.isArray(props.data) ? props.data[0] : props.data));

        setDataSubmit({
            thongTin: rawData.thongTin || "",
            tyLeLop: rawData.tyLeLop || "",
            doDayLop: rawData.doDayLop || "",
            chiTiet: rawData.chiTiet || "",
            ghiChu: rawData.ghiChu || ""
        });
        
    }, [props.data, props.open]); // Giữ nguyên mảng dependency

    const handleInputChange = (fieldName: string, text: string) => {
        setDataSubmit((prevValues: any) => ({
            ...prevValues,
            [fieldName]: text,
        }));
    };

    const handleSave = () => {
        // 1. Đóng gói đầy đủ data của chỉ tiêu hiện tại kèm theo kết quả vừa chọn
        const updatedData = {
            ...data, 
            tyLeLop: dataSubmit?.tyLeLop?.toString(),
            doDayLop: dataSubmit?.doDayLop?.toString(),
            ghiChu: dataSubmit?.ghiChu?.toString()
        };

        console.log("🚀 Dữ liệu mới nhất gửi về trang chính:", updatedData);
        // 2. Bắn ngược kết quả ra hàm onSubmit ở trang chính
        onSubmit(updatedData);

        // 3. Tự động đóng modal sau khi chọn xong để tạo trải nghiệm mượt mà
        handleCancel();
    };

    const handleCancel = () => {
        if (typeof props?.handleOpenBlowingLineModal === 'function') {
            props.handleOpenBlowingLineModal();
        }
    };

    if (!props?.open) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.open}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">

                        {/* Header với Optional Chaining an toàn */}
                        <View className="flex-row justify-between items-center p-5 border-b border-slate-100 relative">
                            <Text className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                                {(props?.title ?? "Thông tin").toUpperCase()}
                            </Text>
                        </View>

                        {loading ? (
                            <View className="py-20 justify-center items-center">
                                <ActivityIndicator size="large" color={AppColors.primary} />
                                <Text className="mt-2 text-slate-400 italic">Đang tải thông tin vật tư...</Text>
                            </View>
                        ) : (
                            <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                                {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                                    {JSON.stringify(props, null, 2)}
                                </Text> */}
                                <View className="pb-6 space-y-3">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-xs font-bold text-slate-400 uppercase">Thông tin:</Text>
                                        <Text className="text-sm font-bold text-cyan-700">{dataSubmit?.thongTin || "---"}</Text>
                                    </View>
                                    {/* <View className="flex-row justify-between mb-2">
                                        <Text className="text-xs font-bold text-slate-400 uppercase">Chi tiết:</Text>
                                        <Text className="text-sm font-bold text-cyan-700">{dataSubmit?.chiTiet || "---"}</Text>
                                    </View> */}
                                    <View>
                                        <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">Tỷ lệ lớp (%):</Text>
                                        <TextInput
                                            className="h-12 border border-slate-200 rounded-xl px-4 bg-slate-50 text-slate-900 font-bold text-lg text-right focus:border-cyan-500"
                                            value={dataSubmit?.tyLeLop?.toString() ?? "0"}
                                            keyboardType="numeric"
                                            onChangeText={(text) => handleInputChange('tyLeLop', text)}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">Độ dày lớp (µm):</Text>
                                        <TextInput
                                            className="h-12 border border-slate-200 rounded-xl px-4 bg-slate-50 text-slate-900 font-bold text-lg text-right focus:border-cyan-500"
                                            value={dataSubmit?.doDayLop?.toString() ?? "0"}
                                            keyboardType="numeric"
                                            onChangeText={(text) => handleInputChange('doDayLop', text)}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">Ghi chú</Text>
                                        <TextInput
                                            className="h-20 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 text-slate-800 text-sm align-top focus:border-cyan-500"
                                            placeholder="Nhập ghi chú (nếu có)..."
                                            value={dataSubmit?.ghiChu?.toString() ?? ""}
                                            multiline={true}
                                            onChangeText={(text) => handleInputChange('ghiChu', text)}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        )}

                        <View className="flex-row p-5 bg-slate-50 border-t border-slate-100 space-x-3">
                            <Pressable
                                onPress={handleCancel}
                                className="flex-1 bg-red-500 py-4 rounded-md active:opacity-80 shadow-sm"
                            >
                                <Text className="text-white font-bold text-center">Hủy</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSave}
                                className="flex-1 bg-emerald-600 py-4 rounded-md active:opacity-80 shadow-sm"
                            >
                                <Text className="text-white font-bold text-center">Lưu lại</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default BlowingLineModal;