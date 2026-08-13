import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ModalPrinterType } from "../type";
import { storeIpPrinter } from "../../Login/store/asyncUserStorage";
import Toast from "react-native-toast-message";

type PrinterModalType = {
    ipTextValue: string;
    handlePrinterModal: () => void;
    open: boolean;
    handleGetValue: (value: ModalPrinterType, ipText: string) => void;
    reloadLocalIp: boolean;
    setReloadLocalIp: (localIp: boolean) => void;
    PrinterData: ModalPrinterType[];
};

const PrinterModal = (props: PrinterModalType) => {
    const {
        ipTextValue,
        handlePrinterModal,
        open,
        handleGetValue,
        reloadLocalIp,
        setReloadLocalIp,
        PrinterData
    } = props;

    const [ipText, setIpText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIpText(ipTextValue);
    }, [ipTextValue]);

    const handleChangeIp = (value: string) => {
        setIpText(value);
    };

    const handleCancel = () => {
        handlePrinterModal();
    };

    const handleSaveIpAddress = async () => {
        if (ipText !== '') {
            setLoading(true);
            await storeIpPrinter({
                ipPrinter: ipText,
            });
            setLoading(false);
            setReloadLocalIp(!reloadLocalIp);
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã lưu IP máy in'
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập ip máy in'
            });
        }
    };

    return (
        <Modal animationType="fade" transparent={true} visible={open}>
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                        <Text className="text-lg font-bold text-slate-800">Chọn mẫu in</Text>
                        <Pressable
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
                            onPress={handleCancel}
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Body */}
                    <View className="p-5">
                        {/* Phần cấu hình IP */}
                        <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                            <Text className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Cấu hình IP máy in</Text>
                            <View className="flex-row items-center space-x-2">
                                <TextInput
                                    className="flex-1 h-11 bg-white border border-slate-200 rounded-xl px-3 text-slate-800 font-bold"
                                    placeholder="192.168.1..."
                                    value={ipText.toString()}
                                    onChangeText={text => handleChangeIp(text)}
                                    keyboardType="numeric"
                                />
                                <Pressable
                                    className="bg-emerald-600 px-4 h-11 justify-center rounded-xl active:opacity-70 shadow-sm shadow-emerald-200"
                                    onPress={handleSaveIpAddress}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text className="text-white font-bold">Lưu</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>

                        {/* Danh sách mẫu in */}
                        <Text className="text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Danh sách mẫu in</Text>
                        <ScrollView className="max-h-60" showsVerticalScrollIndicator={false}>
                            {PrinterData.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleGetValue(item, ipText)}
                                    className="border border-slate-100 bg-white p-4 rounded-2xl mb-3 shadow-sm active:bg-cyan-50 active:border-cyan-100"
                                >
                                    <Text className="text-base font-semibold text-slate-700 text-center">
                                        {item.value}
                                    </Text>
                                </Pressable>
                            ))}

                            {PrinterData.length === 0 && (
                                <View className="py-4 items-center">
                                    <Text className="text-slate-400 italic">Không có mẫu in nào</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Footer - Padding đáy */}
                    <View className="pb-2" />
                </View>
            </View>
        </Modal>
    );
};

export default PrinterModal;