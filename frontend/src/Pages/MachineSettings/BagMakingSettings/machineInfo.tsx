import { faAdd, faTrash, faSave, faXmark, faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import { useNavigation } from "@react-navigation/native";
import { loadingStore } from '../../../Store/loadingStore';
import { AppColors } from '../../../../colors';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import GeneralTable, { TableColumn } from "../../../Components/GeneralTable";
import { BagMakingFormType, Detail, ProductionShiftType, StateType } from './type';
import { BagMakingDetailAtom, BagMakingStatusTypeAtom } from '../store';
// import BagMakingLineModal from '../Modal/BagMakingLineModal';
import { getApi } from '../../../Base/api/api_service';
import { settingStore } from '../../../Store/settingStore';

const BagMakingMachineInfo = () => {
    const navigate = useNavigation();
    const setLoadingAtom = useSetRecoilState(loadingStore);
    const [settings, setSettings] = useRecoilState(settingStore);
    const [typeBagMakingAtom, setTypeBagMakingAtom] = useRecoilState(BagMakingStatusTypeAtom);
    const [fieldFocus, setFieldFocus] = useState('');
    const [formValues, setFormValues] = useRecoilState(BagMakingDetailAtom);
    const [openBagMakingLineModal, setOpenBagMakingLineModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
    const [detail, setDetail] = useState<Detail>({} as Detail);

    const handleOpenBagMakingLineModal = () => {
        setOpenBagMakingLineModal(!openBagMakingLineModal);
    };
    // Cấu hình các cột cho phần GeneralTable hiển thị lưới dữ liệu
    const columns: TableColumn[] = [
        { name: "STT", label: "STT", width: 50 },
        { name: "thongTin", label: "Thông tin", width: 180 },
        { name: "tyLeLop", label: "Tỷ lệ lớp (%)", width: 120 },
        { name: "doDayLop", label: "Độ dày lớp (µm)", width: 120 },
        // { name: "cTiet", label: "C.Tiết" },
        { name: "ghiChu", label: "Ghi chú", width: 180 },
    ];

    const renderCustomCell = (columnName: string, item: any, index: number) => {
        return <Text className="text-gray-700 font-medium text-xs text-center">{item[columnName]}</Text>;
    };

    useEffect(() => {
        console.log("typeBagMakingAtom: ", typeBagMakingAtom)
        console.log("formValues: ", formValues)
        setDetail(formValues?.detail || {});
    }, []);

    const handleFocus = (fieldIsFocus: string) => {
        setFieldFocus(fieldIsFocus);
    };

    const handleOnChange = (value: any, field: string) => {
        setDetail((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // Cập nhật dữ liệu vào formValues
        setFormValues(prevFormValues => ({
            ...prevFormValues,
            detail: { ...detail },
        }));

        navigate.goBack();
    }

    return (
        <View className="flex-1 bg-white">
            <HeaderComponent
                backButton={true}
                handleBack={() => navigate.goBack()}
                iconRight={(
                    <TouchableOpacity onPress={handleSave} className="flex-row items-center px-2">
                        <FontAwesomeIcon icon={faSave} size={24} color={AppColors.primary} />
                    </TouchableOpacity>
                )}
                title="Thông Số Làm Túi"
            />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}  className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 2, paddingBottom: 50 }} 
                    keyboardShouldPersistTaps="handled" className="flex-1 p-3">
                        {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                            {JSON.stringify(detail, null, 2)}
                        </Text> */}
                        <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                            <View className="flex-1">
                                    <Text className="text-gray-600 font-semibold text-md mb-1">Tốc độ:</Text>
                                    <TextInput className="bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-md" value={detail?.tocDo || ""} onChangeText={(text) => handleOnChange(text, 'tocDo')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">DAO:</Text>
                                <TextInput className="bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-md" value={detail?.dao || ""} onChangeText={(text) => handleOnChange(text, 'dao')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Nhiệt độ dao dọc(+/-5°C):</Text>
                                <View className="flex-row gap-2">
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.doc1 || ""} onChangeText={(text) => handleOnChange(text, 'doc1')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.doc2 || ""} onChangeText={(text) => handleOnChange(text, 'doc2')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.doc3 || ""} onChangeText={(text) => handleOnChange(text, 'doc3')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.doc4 || ""} onChangeText={(text) => handleOnChange(text, 'doc4')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.doc5 || ""} onChangeText={(text) => handleOnChange(text, 'doc5')}/>
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Nhiệt độ dao ngang(+/-5°C):</Text>
                                <View className="flex-row gap-2">
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.ngang1 || ""} onChangeText={(text) => handleOnChange(text, 'ngang1')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.ngang2 || ""} onChangeText={(text) => handleOnChange(text, 'ngang2')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.ngang3 || ""} onChangeText={(text) => handleOnChange(text, 'ngang3')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.ngang4 || ""} onChangeText={(text) => handleOnChange(text, 'ngang4')}/>
                                    <TextInput className="flex-1 bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-xs" value={detail?.ngang5 || ""} onChangeText={(text) => handleOnChange(text, 'ngang5')}/>
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Nhiệt độ dao Zipper(+/-5°C):</Text>
                                <TextInput className="bg-white text-gray-800 border border-gray-300 rounded-lg p-2 text-md" value={detail?.daoZipper || ""} onChangeText={(text) => handleOnChange(text, 'daoZipper')}/>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
    );
};

export default BagMakingMachineInfo;