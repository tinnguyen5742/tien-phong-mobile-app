import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MachineType } from "../type";

type MachineModalProps = {
    data: MachineType[];
    handleOpenMachineModal: () => void;
    open: boolean;
    title: string;
    onSubmitMachine: (machine: MachineType) => void; // Giữ nguyên tên logic của bạn
};


const MachineModal = (props: MachineModalProps) => {
    const { handleOpenMachineModal, open, title, data, onSubmitMachine } = props;
    const handleCancel = () => {
        handleOpenMachineModal();
    };
    return (
        <Modal animationType="slide" transparent={true} visible={open}>
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-white rounded-[30px] items-center shadow-xl w-full max-w-sm overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center w-full p-5 border-b border-gray-100">
                        <Text className="text-lg font-bold text-slate-800">{title.toUpperCase()}</Text>
                        <Pressable
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
                            onPress={handleOpenMachineModal}
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Body */}
                    <View className="mt-2 w-full p-4 h-80">
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {data.map((item, key: number) => (
                                <Pressable
                                    key={key}
                                    onPress={() => onSubmitMachine(item)}
                                    className="border border-slate-200 p-4 rounded-2xl mb-3 bg-white active:bg-cyan-50 shadow-sm"
                                >
                                    {/* Dòng 1: Hiển thị Mã */}
                                    <View className="flex-row items-center mb-1">
                                        <Text className="font-bold text-slate-500 mr-2">Mã:</Text>
                                        <Text className="font-bold text-cyan-700">{item.maThietBi}</Text>
                                    </View>

                                    {/* Dòng 2: Hiển thị Tên (nằm dưới dòng Mã) */}
                                    <View className="flex-row items-start">
                                        <Text className="font-bold text-slate-500 mr-2">Tên:</Text>
                                        <Text
                                            className="font-bold text-slate-700 flex-1 text-left"
                                            numberOfLines={2}
                                        >
                                            {item.tenThietBi}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}

                            {data.length === 0 && (
                                <View className="py-10 items-center">
                                    <Text className="text-slate-400 italic">Không có thiết bị nào</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <View className="w-full p-5 bg-gray-50 flex-row justify-center border-t border-gray-100">
                        <Pressable
                            onPress={handleCancel}
                            className="bg-red-500 py-3 px-12 rounded-2xl active:opacity-70 shadow-sm"
                        >
                            <Text className="text-white font-bold text-center">Hủy</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default MachineModal;