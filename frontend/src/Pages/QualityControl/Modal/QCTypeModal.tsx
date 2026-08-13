import React, { useState } from "react";
import { Modal, View, Text, Pressable, } from "react-native";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { QualityControlTypeModal } from "../type";

type QCTypeProps = {
    handleOpenQCType: () => void;
    open: boolean;
    handleChangeTypeQC: (value: string) => void;
};

const QCTypeModal = (props: QCTypeProps) => {
    const {
        handleOpenQCType,
        open,
        handleChangeTypeQC
    } = props;

    const QCTypeList: QualityControlTypeModal[] = [
        {
            label: 'Nguyên liệu',
            value: 'NL'
        },
        {
            label: 'TP/BTP',
            value: 'TP'
        }
    ];

    const handleCancel = () => {
        handleOpenQCType();
    };

    const handleSave = (value: string) => {
        handleChangeTypeQC(value);
        handleOpenQCType();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={open}>
            {/* Overlay nền mờ */}
            <View className="flex-1 justify-center items-center bg-black/50 px-4">

                {/* Modal Container */}
                <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                        <Text className="text-lg font-bold text-slate-800">Loại kiểm</Text>
                        <Pressable
                            onPress={handleCancel}
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Body */}
                    <View className="p-4 space-y-3">
                        {QCTypeList.map((item, index) => (
                            <Pressable
                                key={index}
                                onPress={() => handleSave(item.value)}
                                className="border border-cyan-100 bg-white p-5 rounded-2xl active:bg-cyan-50 shadow-sm items-center justify-center"
                            >
                                <Text className="text-base font-semibold text-slate-700">
                                    {item.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Footer - Khoảng trống tạo độ thoáng cho UI */}
                    <View className="pb-4" />
                </View>
            </View>
        </Modal>
    );
};

export default QCTypeModal;