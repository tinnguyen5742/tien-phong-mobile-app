import React from "react";
import { Modal, View, Text, Pressable, } from "react-native";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { CoronaType } from "../type";

type CoronaModalType = {
    handleCoronaModal: () => void;
    open: boolean;
    handleGetValue: (value: CoronaType) => void;
};

const CoronaModal = (props: CoronaModalType) => {
    const {
        handleCoronaModal,
        open,
        handleGetValue
    } = props;

    const CoronaData: CoronaType[] = [
        { value: 'Mặt trong' },
        { value: 'Mặt ngoài' },
        { value: '2 mặt' }
    ];

    const handleCancel = () => {
        handleCoronaModal();
    };

    const handleSave = (item: CoronaType) => {
        handleGetValue(item);
        handleCoronaModal();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={open}>
            {/* Overlay nền mờ */}
            <View className="flex-1 justify-center items-center bg-black/50 px-6">

                {/* Modal Container */}
                <View className="bg-white rounded-[30px] w-full max-w-sm shadow-2xl overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                        <Text className="text-xl font-bold text-slate-800">Chọn mặt Corona</Text>
                        <Pressable
                            onPress={handleCancel}
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Body - List of Options */}
                    <View className="p-4">
                        {CoronaData.map((item, index) => (
                            <Pressable
                                key={index}
                                onPress={() => handleSave(item)}
                                className="border border-slate-200 bg-white p-5 rounded-2xl mb-3 active:bg-cyan-50 active:border-cyan-200 shadow-sm flex-row justify-center items-center"
                            >
                                <Text className="text-base font-bold text-slate-700">
                                    {item.value}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Footer - Padding đáy cho thoáng */}
                    <View className="pb-2" />
                </View>
            </View>
        </Modal>
    );
};

export default CoronaModal;