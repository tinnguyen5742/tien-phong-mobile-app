import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ProductionShiftType, ColumneSetting } from "../type";
import CheckBox from '@react-native-community/checkbox';
import { useColorScheme } from "nativewind";

type SettingModalProps = {
    handleOpenSettingModal: () => void;
    onSubmit: (data: ProductionShiftType) => void;
    open: boolean;
    title: string;
    selectedColumns: string[];
    setSelectedColumns: (columns: string[]) => void;
    columns: ColumneSetting[];
};

const SettingModal = (props: SettingModalProps) => {
    const { handleOpenSettingModal, open, title, selectedColumns, setSelectedColumns, columns } = props;
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const handleColumnToggle = (columnName: string) => {
        if (selectedColumns.includes(columnName)) {
            setSelectedColumns(selectedColumns.filter(col => col !== columnName));
        } else {
            setSelectedColumns([...selectedColumns, columnName]);
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={open}>
            {/* Lớp nền mờ phía sau */}
            <View className="flex-1 justify-center items-center bg-black/50 px-4">

                {/* Nội dung Modal */}
                <View className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                        <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {title.toUpperCase()}
                        </Text>
                        <Pressable
                            onPress={handleOpenSettingModal}
                            className="p-1 active:opacity-50"
                        >
                            <FontAwesomeIcon
                                icon={faXmark}
                                size={20}
                                color={isDarkMode ? "#cbd5e1" : "#1e293b"}
                            />
                        </Pressable>
                    </View>

                    {/* Body */}
                    <View className="h-80 w-full px-4 py-2">
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="space-y-1">
                                {columns.map((column) => (
                                    <Pressable
                                        key={column.name}
                                        onPress={() => handleColumnToggle(column.name)}
                                        className="flex-row items-center py-1 px-1 active:bg-slate-50 dark:active:bg-slate-800 rounded-xl"
                                    >
                                        <CheckBox
                                            value={selectedColumns.includes(column.name)}
                                            onValueChange={() => handleColumnToggle(column.name)}
                                            tintColors={{ true: '#3b82f6', false: isDarkMode ? '#475569' : '#94a3b8' }}
                                            // Dành cho iOS
                                            onCheckColor="#3b82f6"
                                            onTintColor="#3b82f6"
                                        />
                                        <Text className="ml-3 text-slate-700 dark:text-slate-300 text-base">
                                            {column.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
                        <Pressable
                            onPress={handleOpenSettingModal}
                            className="flex-1 mr-2 bg-red-500 active:bg-red-600 h-11 rounded-md items-center justify-center shadow-sm"
                        >
                            <Text className="text-white font-bold text-base">Hủy</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleOpenSettingModal}
                            className="flex-1 ml-2 bg-green-600 active:bg-green-700 h-11 rounded-md items-center justify-center shadow-sm"
                        >
                            <Text className="text-white font-bold text-base">Lưu</Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default SettingModal;