import React, { useCallback, useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { formatMonth } from "../../../ults";
import { getApi } from "../../../Base/api/api_service";
import Toast from "react-native-toast-message";
import { DepartmentModalValue, DepartmentType } from "../type";
import MonthPicker from 'react-native-month-year-picker';
import { useSetRecoilState } from "recoil";
import { AddressIpPrinterAtom } from "../store";
import { useColorScheme } from "nativewind";

type DepartmentModalProps = {
    handleOpenDepartmentModal: () => void;
    onSubmit: (data: DepartmentModalValue) => void;
    open: boolean;
    title: string;
};

const DepartmentModal = (props: DepartmentModalProps) => {
    const { handleOpenDepartmentModal, onSubmit, open, title } = props;
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const setAddressIpAtom = useSetRecoilState(AddressIpPrinterAtom);
    const [department, setDepartment] = useState<DepartmentType[]>([]);
    const [show, setShow] = useState(false);
    const [dateSx, setDateSx] = useState(new Date());
    const [value, setValue] = useState<DepartmentType>();

    const showPicker = useCallback((v: boolean) => setShow(v), []);

    useEffect(() => {
        handelGetDepartment();
    }, []);

    const onValueChange = useCallback(
        (event: any, newDate: Date) => {
            const selectedDate = newDate || dateSx;
            showPicker(false);
            setDateSx(selectedDate);
        },
        [dateSx, showPicker],
    );

    const handelGetDepartment = async () => {
        try {
            const item = await getApi(`/user/department/list`, {}, "v2");
            if (item) {
                setDepartment(item.data);
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: "Vui lòng kiểm tra lại kết nối" });
        }
    };

    const handleSelected = (item: DepartmentType) => {
        setAddressIpAtom(item.diaChi);
        setValue(item);
    };

    const OnSubmitModal = () => {
        if (!value) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn bộ phận' });
        } else {
            onSubmit({ ...value, month: dateSx });

            console.log("Selected Department:", { ...value, month: dateSx });
            handleOpenDepartmentModal();
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={open}>
            {/* Overlay nền mờ */}
            <View className="flex-1 justify-center items-center bg-black/50 px-4">

                {/* Modal Content */}
                <View className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

                    {/* Header */}
                    <View className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <Text className="text-center text-base font-bold text-slate-900 dark:text-slate-100">
                            {title.toUpperCase()}
                        </Text>
                    </View>

                    {/* Body */}
                    <View className="p-4">
                        {department.length > 0 ? (
                            <View className="h-60">
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {department.map((item, index) => {
                                        const isSelected = value?.maBoPhan === item.maBoPhan;
                                        return (
                                            <Pressable
                                                key={index}
                                                onPress={() => handleSelected(item)}
                                                className={`flex-row items-center justify-between p-3 mb-2 rounded-xl border-2 ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                                                    }`}
                                            >
                                                <View className="flex-row flex-1 mr-2">
                                                    <Text className="font-bold text-slate-500 dark:text-slate-400">Mã: </Text>
                                                    <Text className="text-blue-600 dark:text-blue-400 font-medium">{item.maBoPhan}</Text>
                                                </View>
                                                <View className="flex-row flex-[2]">
                                                    <Text className="font-bold text-slate-500 dark:text-slate-400">Tên: </Text>
                                                    <Text
                                                        numberOfLines={1}
                                                        className="text-blue-600 dark:text-blue-400 font-medium flex-1"
                                                    >
                                                        {item.tenBoPhan}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        ) : (
                            <View className="h-20 items-center justify-center">
                                <ActivityIndicator color="#3b82f6" size="large" />
                            </View>
                        )}

                        {/* Month Selector Button */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="mt-4 flex-row items-center justify-center h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            onPress={() => showPicker(true)}
                        >
                            <Text className="text-slate-800 dark:text-slate-200 font-medium">
                                Tháng: {formatMonth(dateSx)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="p-4 bg-slate-50 dark:bg-slate-800/50">
                        <Pressable
                            onPress={OnSubmitModal}
                            className="w-full bg-green-600 active:bg-green-700 h-12 rounded-md items-center justify-center shadow-md"
                        >
                            <Text className="text-white font-bold text-base">Xác nhận</Text>
                        </Pressable>
                    </View>
                </View>

                {show && (
                    <MonthPicker
                        onChange={onValueChange}
                        value={dateSx}
                        locale="vi"
                    />
                )}
            </View>
        </Modal>
    );
};

export default DepartmentModal;