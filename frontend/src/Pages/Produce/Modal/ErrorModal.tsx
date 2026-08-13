import React from "react";
import { Modal, View, Text, Pressable, Keyboard, TouchableWithoutFeedback } from "react-native";
import { faXmark, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

type ErrorModalProps = {
    handleOpenErrorModal: () => void;
    open: boolean;
    title: string;
    message: string;
};

const ErrorModal = (props: ErrorModalProps) => {
    const { handleOpenErrorModal, message, open, title } = props;

    return (
        <Modal animationType="fade" transparent={true} visible={open}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-center items-center bg-black/50 px-8">
                    <View className="bg-white rounded-[30px] w-full max-w-sm shadow-2xl overflow-hidden">

                        {/* Header với Icon cảnh báo */}
                        <View className="flex-row justify-between items-center p-5 border-b border-red-50">
                            <View className="flex-row items-center space-x-2">
                                <FontAwesomeIcon icon={faCircleExclamation} size={18} color="#ef4444" />
                                <Text className="text-lg font-bold text-red-600 uppercase tracking-tight">
                                    {title}
                                </Text>
                            </View>
                            <Pressable
                                onPress={handleOpenErrorModal}
                                className="w-8 h-8 items-center justify-center rounded-full active:bg-red-50"
                            >
                                <FontAwesomeIcon icon={faXmark} size={18} color="#94a3b8" />
                            </Pressable>
                        </View>

                        {/* Body */}
                        <View className="p-8 items-center">
                            <Text className="text-base text-slate-600 text-center leading-6">
                                {message}
                            </Text>
                        </View>

                        {/* Footer */}
                        <View className="p-5 bg-slate-50 flex-row justify-center border-t border-slate-100">
                            <Pressable
                                onPress={handleOpenErrorModal}
                                className="bg-red-500 py-3 px-12 rounded-2xl active:opacity-80 shadow-md shadow-red-200"
                            >
                                <Text className="text-white font-bold text-center text-base">Đã hiểu</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ErrorModal;