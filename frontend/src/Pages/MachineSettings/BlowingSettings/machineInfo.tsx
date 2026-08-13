import {
  faAdd,
  faTrash,
  faSave,
  faXmark,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {useNavigation} from '@react-navigation/native';
import {loadingStore} from '../../../Store/loadingStore';
import {AppColors} from '../../../../colors';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import GeneralTable, {TableColumn} from '../../../Components/GeneralTable';
import {
  BlowingFormType,
  Detail,
  Details2,
  ProductionShiftType,
  StateType,
} from './type';
import {BlowingDetailAtom, BlowingStatusTypeAtom} from '../store';
import BlowingLineModal from '../Modal/BlowingLineModal';
import {getApi} from '../../../Base/api/api_service';
import {settingStore} from '../../../Store/settingStore';

const BlowingMachineInfo = () => {
  const navigate = useNavigation();
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const [settings, setSettings] = useRecoilState(settingStore);
  const [typeBlowingAtom, setTypeBlowingAtom] = useRecoilState(
    BlowingStatusTypeAtom,
  );
  const [fieldFocus, setFieldFocus] = useState('');
  const [formValues, setFormValues] = useRecoilState(BlowingDetailAtom);
  const [openBlowingLineModal, setOpenBlowingLineModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
  const [currentLineForm, setCurrentLineForm] = useState<Details2>(
    {} as Details2,
  );
  const [detail, setDetail] = useState<Detail>({} as Detail);
  const [details2, setDetails2] = useState<Details2[]>([] as Details2[]);

  const handleOpenBlowingLineModal = () => {
    setOpenBlowingLineModal(!openBlowingLineModal);
  };
  // Cấu hình các cột cho phần GeneralTable hiển thị lưới dữ liệu
  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT', width: 50},
    {name: 'thongTin', label: 'Thông tin', width: 180},
    {name: 'tyLeLop', label: 'Tỷ lệ lớp (%)', width: 120},
    {name: 'doDayLop', label: 'Độ dày lớp (µm)', width: 120},
    // { name: "cTiet", label: "C.Tiết" },
    {name: 'ghiChu', label: 'Ghi chú', width: 180},
  ];

  const renderCustomCell = (columnName: string, item: any, index: number) => {
    return (
      <Text className="text-gray-700 font-medium text-xs text-center">
        {item[columnName]}
      </Text>
    );
  };

  useEffect(() => {
    // console.log("typeBlowingAtom: ", typeBlowingAtom)
    // console.log("formValues: ", formValues)
    setDetail(formValues?.detail || {});
    setDetails2(formValues?.details2 || []);
    if (formValues?.details2?.length === 0) {
      handleGetDetails2();
    }
  }, []);

  const handleGetDetails2 = async () => {
    setLoadingAtom(true);
    const url = `/machines/info/blower/layers`;
    const item = await getApi(url, {});
    // console.log("handleGetStaff url: ", url);
    // console.log("handleGetDetails2: ", item);

    if (item?.data.length > 0) {
      setDetails2(item.data);
    } else {
      setDetails2([]);
      Toast.show({
        type: 'error',
        text1: 'Rỗng',
        text2: 'Danh sách máy móc rỗng',
      });
    }
    setLoadingAtom(false);
  };

  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };

  const handleOnChange = (value: any, field: string) => {
    setDetail((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (item: any, index: number) => {
    console.log('item Line edit: ', item);
    setCurrentLineForm(item);
    setEditIndex(index);
    setOpenBlowingLineModal(true);
    console.log('nạp dữ liệu edit vào Modal: ', item);
  };

  const handleSubmitLine = (updatedLine: any) => {
    console.log('🚀 Kết quả nhận từ Modal:', updatedLine);

    // 💡 ĐÃ FIX 1: Đổi từ `editLineIndex` thành `editIndex` cho khớp với hàm handleEdit
    if (editIndex !== null) {
      // 1. Cập nhật State cục bộ hiển thị trên lưới của Trang này ngay lập tức
      setDetails2((prevLines: Details2[]) => {
        const newLines = [...prevLines];
        newLines[editIndex] = {
          ...newLines[editIndex],
          ...updatedLine,
        };

        // 💡 ĐÃ FIX 2: Đồng bộ trực tiếp mảng mới này vào Recoil Atom (BlowingDetailAtom)
        // Việc này giúp đảm bảo dữ liệu luôn được lưu vết, dù người dùng có bấm Save hay Back.
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          details2: newLines,
        }));

        return newLines;
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã cập nhật thông tin lớp: ${updatedLine.thongTin || ''}`,
      });
    } else {
      console.warn('⚠️ Không tìm thấy index của dòng cần chỉnh sửa!');
    }

    // Đóng Modal và giải phóng vị trí index chỉnh sửa
    setOpenBlowingLineModal(false);
    setEditIndex(null); // Đưa trạng thái editIndex về lại null an toàn
  };

  const handleSave = () => {
    // Cập nhật dữ liệu vào formValues
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      detail: {...detail},
      details2: [...details2],
    }));

    navigate.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      <HeaderComponent
        backButton={true}
        handleBack={() => navigate.goBack()}
        iconRight={
          <TouchableOpacity
            onPress={handleSave}
            className="flex-row items-center px-2">
            <FontAwesomeIcon
              icon={faSave}
              size={24}
              color={AppColors.primary}
            />
          </TouchableOpacity>
        }
        title="Thông Số Thổi"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 2, paddingBottom: 50}}
          keyboardShouldPersistTaps="handled"
          className="flex-1 p-3">
          {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                        {JSON.stringify(formValues.detail, null, 2)}
                    </Text> */}
          {/* KHỐI 2: THÔNG SỐ KỸ THUẬT VẬN HÀNH MÁY */}
          <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
            {/* Hàng 1: Công suất | Gió ngoài | Tốc độ đầu xoay đỉnh */}
            <Text className="text-[16px] font-bold text-primary mb-2">
              Thông số kỹ thuật
            </Text>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Công suất:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.congSuat || ''}
                  onChangeText={text => handleOnChange(text, 'congSuat')}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Gió ngoài:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.gioNgoai || ''}
                  onChangeText={text => handleOnChange(text, 'gioNgoai')}
                />
              </View>
            </View>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Tốc độ xoay đỉnh(%):
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.dauXoayDinh || ''}
                  onChangeText={text => handleOnChange(text, 'dauXoayDinh')}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Tốc độ kéo:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.tocDoKeo || ''}
                  onChangeText={text => handleOnChange(text, 'tocDoKeo')}
                />
              </View>
            </View>
            {/* Hàng 2: Tốc độ kéo | Gió trong | BUR */}
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Gió trong:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.gioTrong || ''}
                  onChangeText={text => handleOnChange(text, 'gioTrong')}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  BUR:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.bur || ''}
                  onChangeText={text => handleOnChange(text, 'bur')}
                />
              </View>
            </View>
          </View>

          {/* KHỐI 3: LỰC CĂNG MÀNG (TAPER & TENSION W1/W2) */}
          <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
            {/* <Text className="text-sm font-bold text-slate-800 mb-2 pl-1">Lực căng màng:</Text> */}
            <Text className="text-[16px] font-bold text-primary">
              Lực căng màng
            </Text>
            {/* Cột Taper */}
            <Text className="text-cyan-900 font-bold text-xs border-b border-cyan-200 pb-1">
              Taper
            </Text>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  W1:
                </Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800"
                  value={detail?.taperW1 || ''}
                  onChangeText={text => handleOnChange(text, 'taperW1')}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  W2:
                </Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800"
                  value={detail?.taperW2 || ''}
                  onChangeText={text => handleOnChange(text, 'taperW2')}
                />
              </View>
            </View>

            {/* Cột Tension */}
            <Text className="text-cyan-900 font-bold text-xs border-b border-cyan-200 pb-1">
              Tension
            </Text>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  W1:
                </Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800"
                  value={detail?.tensionW1 || ''}
                  onChangeText={text => handleOnChange(text, 'tensionW1')}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  W2:
                </Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-1.5 text-md text-gray-800"
                  value={detail?.tensionW2 || ''}
                  onChangeText={text => handleOnChange(text, 'tensionW2')}
                />
              </View>
            </View>
          </View>

          {/* Áp suất - Nhiệt */}
          <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 space-y-3">
            <Text className="text-[16px] font-bold text-primary">
              Áp suất - Nhiệt
            </Text>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Nhiệt máy đùn:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.nhietMayDun || ''}
                  onChangeText={text => handleOnChange(text, 'nhietMayDun')}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Nhiệt cổ lưới:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.nhietCoLuoi || ''}
                  onChangeText={text => handleOnChange(text, 'nhietCoLuoi')}
                />
              </View>
            </View>

            {/* Hàng 2: Tốc độ kéo | Gió trong | BUR */}
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Nhiệt đầu Die:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.nhietDauDie || ''}
                  onChangeText={text => handleOnChange(text, 'nhietDauDie')}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 font-semibold text-[11px] mb-1">
                  Áp suất đùn:
                </Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 text-md text-gray-800"
                  value={detail?.apSuatDun || ''}
                  onChangeText={text => handleOnChange(text, 'apSuatDun')}
                />
              </View>
            </View>
          </View>
          {/* KHỐI 4: LƯỚI BẢNG THÔNG TIN CẤU TRÚC LỚP SẢN XUẤT */}
          {/* <View className="flex-row justify-between items-center mb-2 px-1">
                        <Text className="text-sm font-bold text-gray-900">Chi tiết cấu trúc thành phần lớp</Text>
                        <Pressable className="bg-primary p-1.5 rounded-lg">
                            <FontAwesomeIcon icon={faAdd} size={14} color="white" />
                        </Pressable>
                    </View> */}

          {/* <View className="mb-14 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <GeneralTable
                            data={details2 || []}
                            columns={columns}
                            selectedColumns={["STT","thongTin","tyLeLop","doDayLop","cTiet","ghiChu"]}
                            onRowPress={(item, index) => handleEdit(item, index)}
                            renderCell={renderCustomCell}
                        />
                    </View>
                    <BlowingLineModal data={currentLineForm} handleOpenBlowingLineModal={handleOpenBlowingLineModal} onSubmit={handleSubmitLine} open={openBlowingLineModal} title="Chỉnh sửa dòng"/> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default BlowingMachineInfo;
