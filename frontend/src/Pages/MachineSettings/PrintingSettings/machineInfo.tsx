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
import { PrintingFormType, Detail, ProductionShiftType, StateType } from './type';
import { PrintingDetailAtom, PrintingStatusTypeAtom } from '../store';
// import PrintingLineModal from '../Modal/PrintingLineModal';
import { getApi } from '../../../Base/api/api_service';
import { settingStore } from '../../../Store/settingStore';

const PrintingMachineInfo = () => {
    const navigate = useNavigation();
    const setLoadingAtom = useSetRecoilState(loadingStore);
    const [settings, setSettings] = useRecoilState(settingStore);
    const [typePrintingAtom, setTypePrintingAtom] = useRecoilState(PrintingStatusTypeAtom);
    const [fieldFocus, setFieldFocus] = useState('');
    const [formValues, setFormValues] = useRecoilState(PrintingDetailAtom);
    const [openPrintingLineModal, setOpenPrintingLineModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
    const [detail, setDetail] = useState<Detail>({} as Detail);

    const handleOpenPrintingLineModal = () => {
        setOpenPrintingLineModal(!openPrintingLineModal);
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
        // console.log("typePrintingAtom: ", typePrintingAtom)
        // console.log("formValues: ", formValues)
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
                title="Thông Số In"
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}  className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 2, paddingBottom: 50 }} 
                    keyboardShouldPersistTaps="handled" className="flex-1 p-3">
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary mb-2">Lực căng</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Tốc độ máy:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.tocDoMay || ""} onChangeText={(text) => handleOnChange(text, 'tocDoMay')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Unwin:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.cangUnwin || ""} onChangeText={(text) => handleOnChange(text, 'cangUnwin')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Infeed:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.cangInfeed || ""} onChangeText={(text) => handleOnChange(text, 'cangInfeed')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Outfeed:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.cangOutfeed || ""} onChangeText={(text) => handleOnChange(text, 'cangOutfeed')}/>
                            </View>
                        </View>
                    </View>
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary mb-2">Cuộn thu</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Rewind:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.cangRewind || ""} onChangeText={(text) => handleOnChange(text, 'cangRewind')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Lô lay-on (on/off):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.ctLoLayon || ""} onChangeText={(text) => handleOnChange(text, 'ctLoLayon')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Lực ép lô lay-on:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.ctLucEpLo || ""} onChangeText={(text) => handleOnChange(text, 'ctLucEpLo')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Thu cuộn:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.ctThuCuon || ""} onChangeText={(text) => handleOnChange(text, 'ctThuCuon')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Chiller (°C):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.ctChiller || ""} onChangeText={(text) => handleOnChange(text, 'ctChiller')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Corona (W):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.ctCorona || ""} onChangeText={(text) => handleOnChange(text, 'ctCorona')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Hỗn hợp dung môi:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.honHopDungMoi || ""} onChangeText={(text) => handleOnChange(text, 'honHopDungMoi')}/>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default PrintingMachineInfo;