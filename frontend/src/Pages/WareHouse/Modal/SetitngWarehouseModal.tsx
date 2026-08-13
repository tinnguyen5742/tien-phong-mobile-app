import React from "react";
import { Modal, View, Text, Pressable, ScrollView, TouchableWithoutFeedback } from "react-native";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import CheckBox from '@react-native-community/checkbox';
import { ColumneSetting } from "../../Produce/type";
import { AppColors } from "../../../../colors";

type SettingWarehouseDetailProps = {
    handleOpenSettingWarehouseDetail: () => void;
    open: boolean;
    title: string;
    selectedColumns: string[];
    setSelectedColumns: (columns: string[]) => void;
    columns: ColumneSetting[];
};

const SettingWarehouseDetail = (props: SettingWarehouseDetailProps) => {
    const {
        handleOpenSettingWarehouseDetail,
        open,
        title,
        selectedColumns,
        setSelectedColumns,
        columns
    } = props;

    const handleCancel = () => {
        handleOpenSettingWarehouseDetail();
    };

    const handleColumnToggle = (columnName: string) => {
        if (selectedColumns.includes(columnName)) {
            setSelectedColumns(selectedColumns.filter(col => col !== columnName));
        } else {
            setSelectedColumns([...selectedColumns, columnName]);
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={open}>
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                        <Text className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                            {title}
                        </Text>
                        <Pressable
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
                            onPress={handleOpenSettingWarehouseDetail}
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Body */}
                    <View className="p-4 h-80">
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="space-y-1">
                                {columns.map((column, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => handleColumnToggle(column.name)}
                                        className="flex-row items-center justify-between p-4 rounded-2xl border border-slate-100 mb-2 bg-white active:bg-cyan-50 shadow-sm"
                                    >
                                        <Text className={`text-sm font-medium ${selectedColumns.includes(column.name) ? 'text-cyan-700' : 'text-slate-500'}`}>
                                            {column.label}
                                        </Text>
                                        <CheckBox
                                            disabled={false}
                                            value={selectedColumns.includes(column.name)}
                                            onValueChange={() => handleColumnToggle(column.name)}
                                            tintColors={{ true: AppColors.primary, false: '#cbd5e1' }}
                                            // Đối với iOS:
                                            onCheckColor={AppColors.primary}
                                            onTintColor={AppColors.primary}
                                        />
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <View className="p-5 bg-slate-50 border-t border-slate-100">
                        <Pressable
                            onPress={handleCancel}
                            className="bg-blue-600 py-3 rounded-md active:bg-blue-700 shadow-sm"
                        >
                            <Text className="text-white font-bold text-center text-base">Xác nhận</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SettingWarehouseDetail;