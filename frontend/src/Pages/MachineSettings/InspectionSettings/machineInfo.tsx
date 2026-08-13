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
import { InspectionDetailAtom, InspectionStatusTypeAtom,  } from '../store';
// import SlittingLineModal from '../Modal/SlittingLineModal';
import { getApi } from '../../../Base/api/api_service';
import { settingStore } from '../../../Store/settingStore';

const InspectionMachineInfo = () => {
    const navigate = useNavigation();
    const setLoadingAtom = useSetRecoilState(loadingStore);
    const [settings, setSettings] = useRecoilState(settingStore);
    const [typeInspectionAtom, setTypeInspectionAtom] = useRecoilState(InspectionStatusTypeAtom);
    const [fieldFocus, setFieldFocus] = useState('');
    const [formValues, setFormValues] = useRecoilState(InspectionDetailAtom);
    const [openInspectionLineModal, setOpenInspectionLineModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
    const [detail, setDetail] = useState<Detail>({} as Detail);

    const handleOpenInspectionLineModal = () => {
        setOpenInspectionLineModal(!openInspectionLineModal);
    };

    useEffect(() => {
        console.log("typeInspectionAtom: ", typeInspectionAtom)
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
                title="Thông Số Kiểm Phẩm"
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}  className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 2, paddingBottom: 50 }} 
                    keyboardShouldPersistTaps="handled" className="flex-1 p-3">
                    {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                        {JSON.stringify(formValues, null, 2)}
                    </Text> */}
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        {/* <Text className="text-[16px] font-bold text-primary">Tốc độ & Khổ</Text> */}
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-xs mb-1">Độ dày(mic):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.doDay || ""} onChangeText={(text) => handleOnChange(text, 'doDay')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-[5px]">Độ dày(m/phút)(±10):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.tocDo || ""} onChangeText={(text) => handleOnChange(text, 'tocDo')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-xs mb-1">ĐK cuộn xả(mm):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.dkCuonXa || ""} onChangeText={(text) => handleOnChange(text, 'dkCuonXa')}/>
                            </View>
                        </View>
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] text-primary font-bold border-b border-cyan-200 pb-1">Lực căng(N)</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Cuộn xả:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucCangXa || ""} onChangeText={(text) => handleOnChange(text, 'lucCangXa')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Cuộn thu:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.lucCangThu || ""} onChangeText={(text) => handleOnChange(text, 'lucCangThu')}/>
                            </View>
                        </View>
                        <Text className="text-[16px] text-primary font-bold border-b border-cyan-200 pb-1">Tapper(%)</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Cuộn xả:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.taperXa || ""} onChangeText={(text) => handleOnChange(text, 'taperXa')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Cuộn thu:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800" value={detail?.taperThu || ""} onChangeText={(text) => handleOnChange(text, 'taperThu')}/>
                            </View>
                        </View>
                    </View>
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary">Ghi chú</Text>
                        <TextInput
                            className="flex-1 bg-white border border-gray-300 rounded-lg p-2 min-h-[60px] text-gray-800"
                            multiline={true}
                            placeholder="Nhập ghi chú"
                            onChangeText={text => setDetail(prev => ({ ...prev, ghiChu: text }))}
                            value={detail?.ghiChu}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default InspectionMachineInfo;