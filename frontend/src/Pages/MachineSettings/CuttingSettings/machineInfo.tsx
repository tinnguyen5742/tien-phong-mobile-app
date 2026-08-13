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
import { CuttingFormType, Detail, ProductionShiftType, StateType } from './type';
import { CuttingDetailAtom, CuttingStatusTypeAtom } from '../store';
import { getApi } from '../../../Base/api/api_service';
import { settingStore } from '../../../Store/settingStore';

const CuttingMachineInfo = () => {
    const navigate = useNavigation();
    const setLoadingAtom = useSetRecoilState(loadingStore);
    const [settings, setSettings] = useRecoilState(settingStore);
    const [typeCuttingAtom, setTypeCuttingAtom] = useRecoilState(CuttingStatusTypeAtom);
    const [fieldFocus, setFieldFocus] = useState('');
    const [formValues, setFormValues] = useRecoilState(CuttingDetailAtom);
    const [openCuttingLineModal, setOpenCuttingLineModal] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
    const [detail, setDetail] = useState<Detail>({} as Detail);

    const handleOpenCuttingLineModal = () => {
        setOpenCuttingLineModal(!openCuttingLineModal);
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
        // console.log("typeCuttingAtom: ", typeCuttingAtom)
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
                title="Thông Số Cắt"
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}  className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 2, paddingBottom: 50 }} 
                    keyboardShouldPersistTaps="handled" className="flex-1 p-3">
                    {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                        {JSON.stringify(formValues.detail, null, 2)}
                    </Text> */}
                    {/* KHỐI 2: THÔNG SỐ KỸ THUẬT VẬN HÀNH MÁY */}
                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary mb-2">Thông số kỹ thuật</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Chạy cuộn đơn:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.chayCuonDon || ""} onChangeText={(text) => handleOnChange(text, 'chayCuonDon')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Vải nhiệt:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.vaiNhiet || ""} onChangeText={(text) => handleOnChange(text, 'vaiNhiet')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Tốc độ máy(túi/phút)(±10):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.tocDoMay || ""} onChangeText={(text) => handleOnChange(text, 'tocDoMay')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Cuộn trên+dưới:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.cuonTrenDuoi || ""} onChangeText={(text) => handleOnChange(text, 'cuonTrenDuoi')}/>
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

                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary mb-2">Lực căng (Kgf)(±5)</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Trạm dao ngang:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.lucCangDaoNgang || ""} onChangeText={(text) => handleOnChange(text, 'lucCangDaoNgang')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Trạm sau dàn xả:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.lucCangSauDauXa || ""} onChangeText={(text) => handleOnChange(text, 'lucCangSauDauXa')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Trạm dao dọc:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.lucCangDaoDoc || ""} onChangeText={(text) => handleOnChange(text, 'lucCangDaoDoc')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Dàn xả:</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.danXa || ""} onChangeText={(text) => handleOnChange(text, 'danXa')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Độ nhúng dao(mm):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.doNhungDao || ""} onChangeText={(text) => handleOnChange(text, 'doNhungDao')}/>
                            </View>
                        </View>
                    </View>

                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary mb-2">Áp lực (Kgf)(0.2)</Text>
                        <Text className="text-[14px] font-bold text-primary text-center">Trục đầu (L/R)</Text>
                        <View className="flex-row space-x-2">
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucDauL || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucDauL')}/>
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucDauR || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucDauR')}/>
                        </View>
                        <Text className="text-[14px] font-bold text-primary text-center">Trục sau (L/R)</Text>
                        <View className="flex-row space-x-2">
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucSauL || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucSauL')}/>
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucSauR || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucSauR')}/>
                        </View>
                        <Text className="text-[14px] font-bold text-primary text-center">Trục giữa 1 (L/R)</Text>
                        <View className="flex-row space-x-2">
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucGiua1L || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucGiua1L')}/>
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucGiua1R || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucGiua1R')}/>
                        </View>
                        <Text className="text-[14px] font-bold text-primary text-center">Trục giữa 2 (L/R)</Text>
                        <View className="flex-row space-x-2">
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucGiua2L || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucGiua2L')}/>
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucGiua2R || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucGiua2R')}/>
                        </View>
                        <Text className="text-[14px] font-bold text-primary text-center">Trục giữa 3 (L/R)</Text>
                        <View className="flex-row space-x-2">
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucGiua3L || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucGiua3L')}/>
                            <TextInput className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.apLucTrucGiua3R || ""} onChangeText={(text) => handleOnChange(text, 'apLucTrucGiua3R')}/>
                        </View>
                    </View>

                    {/* <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary mb-2">Dao nhiệt dọc</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Nhiệt chạy dọc(°C):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.docNhietChayDoc || ""} onChangeText={(text) => handleOnChange(text, 'docNhietChayDoc')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Nhiệt chạy ngang(°C):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.docNhietChayNgang || ""} onChangeText={(text) => handleOnChange(text, 'docNhietChayNgang')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Vị trí chạy dọc(cm):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.docVTChayDoc || ""} onChangeText={(text) => handleOnChange(text, 'docVTChayDoc')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Vị trí chạy ngang(cm):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.docVTChayNgang || ""} onChangeText={(text) => handleOnChange(text, 'docVTChayNgang')}/>
                            </View>
                        </View>
                    </View>

                    <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
                        <Text className="text-[16px] font-bold text-primary mb-2">Dao nhiệt ngang</Text>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Nhiệt chạy dọc(°C):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.ngangNhietChayDoc || ""} onChangeText={(text) => handleOnChange(text, 'ngangNhietChayDoc')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Nhiệt chạy ngang(°C):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.ngangNhietChayNgang || ""} onChangeText={(text) => handleOnChange(text, 'ngangNhietChayNgang')}/>
                            </View>
                        </View>
                        <View className="flex-row space-x-2">
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Vị trí chạy dọc(cm):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.nganhVTChayDoc || ""} onChangeText={(text) => handleOnChange(text, 'nganhVTChayDoc')}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 font-semibold text-[11px] mb-1">Vị trí chạy ngang(cm):</Text>
                                <TextInput className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800" value={detail?.nganhVTChayNgang || ""} onChangeText={(text) => handleOnChange(text, 'nganhVTChayNgang')}/>
                            </View>
                        </View>
                    </View> */}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default CuttingMachineInfo;