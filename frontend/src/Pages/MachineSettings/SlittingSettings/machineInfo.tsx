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
import { Detail, ProductionShiftType, StateType } from './type';
import { SlittingDetailAtom, SlittingStatusTypeAtom } from '../store';
// import SlittingLineModal from '../Modal/SlittingLineModal';
import { getApi } from '../../../Base/api/api_service';
import { settingStore } from '../../../Store/settingStore';

const SlittingMachineInfo = () => {
    const navigate = useNavigation();
    const setLoadingAtom = useSetRecoilState(loadingStore);
    const [settings, setSettings] = useRecoilState(settingStore);
    const [typeSlittingAtom, setTypeSlittingAtom] = useRecoilState(SlittingStatusTypeAtom);
    const [fieldFocus, setFieldFocus] = useState('');
    const [formValues, setFormValues] = useRecoilState(SlittingDetailAtom);
    const [openSlittingLineModal, setOpenSlittingLineModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
    const [detail, setDetail] = useState<Detail>({} as Detail);

    const handleOpenSlittingLineModal = () => {
        setOpenSlittingLineModal(!openSlittingLineModal);
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
        console.log("typeSlittingAtom: ", typeSlittingAtom)
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
                title="Thông Số Chia"
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}  className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 2, paddingBottom: 50 }} 
                    keyboardShouldPersistTaps="handled" className="flex-1 p-3">
                    {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                        {JSON.stringify(formValues, null, 2)}
                    </Text> */}
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary">Tốc độ & Khổ</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Tốc độ(m/phút)(±):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.tocDo || ""} onChangeText={(text) => handleOnChange(text, 'tocDo')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Khổ chia(mm)(±):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.khoChia || ""} onChangeText={(text) => handleOnChange(text, 'khoChia')}/>
                            </View>
                        </View>
                    </View>
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary">Lực căng</Text>
                        <Text className="text-cyan-900 font-bold text-xs border-b border-cyan-200 pb-1">Cuộn xả</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Tự động(N):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucXaCuon || ""} onChangeText={(text) => handleOnChange(text, 'lucXaCuon')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Ban đầu(%):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucXaBD || ""} onChangeText={(text) => handleOnChange(text, 'lucXaBD')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Thực tế(N)(±0.2):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucXaTT || ""} onChangeText={(text) => handleOnChange(text, 'lucXaTT')}/>
                            </View>
                        </View>
                        <Text className="text-cyan-900 font-bold text-xs border-b border-cyan-200 pb-1">Cuộn thu trên</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Ban đầu(N):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucThuTren || ""} onChangeText={(text) => handleOnChange(text, 'lucThuTren')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Thực tế(%):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucThuTrenTT || ""} onChangeText={(text) => handleOnChange(text, 'lucThuTrenTT')}/>
                            </View>
                        </View>
                        <Text className="text-cyan-900 font-bold text-xs border-b border-cyan-200 pb-1">Cuộn thu dưới</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Ban đầu(N):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucThuDuoi || ""} onChangeText={(text) => handleOnChange(text, 'lucThuDuoi')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Thực tế(%):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucThuDuoiTT || ""} onChangeText={(text) => handleOnChange(text, 'lucThuDuoiTT')}/>
                            </View>
                        </View>
                    </View>
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary">Tapper</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Trên:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.tapperTren || ""} onChangeText={(text) => handleOnChange(text, 'tapperTren')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Dưới:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.tapperDuoi || ""} onChangeText={(text) => handleOnChange(text, 'tapperDuoi')}/>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SlittingMachineInfo;