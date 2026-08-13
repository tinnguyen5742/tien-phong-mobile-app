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
import { Detail, ProductionShiftType, StateType, LaminatingFormType } from './type';
import { LaminatingDetailAtom, LaminatingStatusTypeAtom } from '../store';
// import BlowingLineModal from '../Modal/BlowingLineModal';
import { getApi } from '../../../Base/api/api_service';
import { settingStore } from '../../../Store/settingStore';

const LaminatingMachineInfo = () => {
    const navigate = useNavigation();
    const setLoadingAtom = useSetRecoilState(loadingStore);
    const [settings, setSettings] = useRecoilState(settingStore);
    const [typeLaminatingAtom, setTypeLaminatingAtom] = useRecoilState(LaminatingStatusTypeAtom);
    const [fieldFocus, setFieldFocus] = useState('');
    const [formValues, setFormValues] = useRecoilState(LaminatingDetailAtom);
    const [openLaminatingLineModal, setOpenLaminatingLineModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
    const [detail, setDetail] = useState<Detail>({} as Detail);

    const handleOpenLaminatingLineModal = () => {
        setOpenLaminatingLineModal(!openLaminatingLineModal);
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
        // console.log("typeLaminatingAtom: ", typeLaminatingAtom)
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
                title="Thông Số Ghép"
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}  className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 2, paddingBottom: 50 }} 
                    keyboardShouldPersistTaps="handled" className="flex-1 p-3">
                    {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                        {JSON.stringify(formValues, null, 2)}
                    </Text> */}
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary">Thông số chi tiết</Text>
                        
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Tốc độ:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.tocDo || ""} onChangeText={(text) => handleOnChange(text, 'tocDo')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Chất liệu:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.chatLieu || ""} onChangeText={(text) => handleOnChange(text, 'chatLieu')}/>
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Loại keo:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.loaiKeo || ""} onChangeText={(text) => handleOnChange(text, 'loaiKeo')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Độ dày (mic):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.doDayMic || ""} onChangeText={(text) => handleOnChange(text, 'doDayMic')}/>
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Tốc độ (m/p)(+5):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.tocDoMP || ""} onChangeText={(text) => handleOnChange(text, 'tocDoMP')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">Glue (%):</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.glue || ""} onChangeText={(text) => handleOnChange(text, 'glue')}/>
                            </View>
                        </View>
                    </View>
                    {/* <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary">Kỳ</Text>
                        
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">CDM 1:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.cdM1 || ""} onChangeText={(text) => handleOnChange(text, 'cdM1')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">KDM 1:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.kdM1 || ""} onChangeText={(text) => handleOnChange(text, 'kdM1')}/>
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">CDM 2:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.cdM2 || ""} onChangeText={(text) => handleOnChange(text, 'cdM2')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">KDM 2:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.kdM2 || ""} onChangeText={(text) => handleOnChange(text, 'kdM2')}/>
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">CDM 3:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.cdM3 || ""} onChangeText={(text) => handleOnChange(text, 'cdM3')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">KDM 3:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.kdM3 || ""} onChangeText={(text) => handleOnChange(text, 'kdM3')}/>
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">CDM 4:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.cdM4 || ""} onChangeText={(text) => handleOnChange(text, 'cdM4')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-md mb-1">KDM 4:</Text>
                                <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.kdM4 || ""} onChangeText={(text) => handleOnChange(text, 'kdM4')}/>
                            </View>
                        </View>
                    </View> */}
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <View className="flex-1">
                            <Text className="text-gray-600 font-semibold text-md mb-1">Hàm lượng keo phủ:</Text>
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.hamLuongKeoPhu || ""} onChangeText={(text) => handleOnChange(text, 'hamLuongKeoPhu')}/>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-600 font-semibold text-md mb-1">Corona:</Text>
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-500 bg-white" value={detail?.corona || ""} onChangeText={(text) => handleOnChange(text, 'corona')}/>
                        </View>
                    </View>

                    {/* <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary">Ghi chú</Text>
                        <TextInput
                            className="flex-1 bg-white border border-gray-300 rounded-lg p-2 min-h-[60px] text-gray-800"
                            multiline={true}
                            placeholder="Nhập ghi chú"
                            onChangeText={text => setDetail(prev => ({ ...prev, dienGiai: text }))}
                            value={detail?.dienGiai}
                        />
                    </View> */}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default LaminatingMachineInfo;