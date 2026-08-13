import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {faXmark, faCamera} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {settingStore} from '../../../Store/settingStore';
import Toast from 'react-native-toast-message';
import {LineFormStockTake} from '../type';
import {getApi} from '../../../Base/api/api_service';
import {AppColors} from '../../../../colors';

type StockTakeLineModalProps = {
  data?: LineFormStockTake;
  handleOpenLineModal: () => void;
  onSubmit: (data: LineFormStockTake) => void;
  open: boolean;
  status: string;
  setStatusLine: (status: string) => void;
  maLocator: string;
};

const StockTakeLineModal = (props: StockTakeLineModalProps) => {
  const {
    handleOpenLineModal,
    open,
    onSubmit,
    data,
    status,
    setStatusLine,
    maLocator,
  } = props;

  const [settings, setSettings] = useRecoilState(settingStore);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [lineForm, setLineForm] = useState<LineFormStockTake>({
    maLocator: props.maLocator,
    maVatTu: '',
    tenVatTu: '',
    dvtGoc: '',
    soLo: '',
    soLuongKK: 0,
  });

  useEffect(() => {
    if (open) {
      if (status === 'EDIT' && data) {
        setLineForm(data);
      } else {
        setLineForm({
          maLocator: props.maLocator,
          maVatTu: '',
          tenVatTu: '',
          dvtGoc: '',
          soLo: '',
          soLuongKK: 0,
        });
      }
    }
  }, [open, data, status]);

  const handleCancel = () => {
    setStatusLine('NEW');
    handleOpenLineModal();
  };

  const handleChangeForm = (key: keyof LineFormStockTake, value: any) => {
    setLineForm(prev => ({...prev, [key]: value}));
  };

  const handleNumericInput = (key: keyof LineFormStockTake, text: string) => {
    const decimalRegex = /^-?\d*\.?\d*$/;
    if (decimalRegex.test(text) || text === '') {
      handleChangeForm(key, text);
    }
  };
  // ✅ Xử lý QR Scan - Cập nhật trực tiếp vào lineForm
  const handleQRCodeScanned = (code: string) => {
    const trimmedCode = code.trim();
    handleChangeForm('maVatTu', trimmedCode);
    setShowCameraModal(false);
  };
  //  const handleScanResult = (qrData: string) => {
  //     console.log("🔍 QR Code Data from Camera:", qrData);
  //     handleQRCodeScanned(qrData);
  //     setShowCameraModal(false);
  // };
  const getVTbyMaVT = async (id: string) => {
    try {
      const url = `/materials/${id}`;
      const response = await getApi(url, {});
      // console.log('Dữ liệu Server trả về:', response);
      if (response && response.data) {
        return response.data;
      }
    } catch (error: any) {
      console.error('❌ Lỗi xảy ra tại hàm getList ở Page:', error);
    }
  };

  const handleScanResult = async (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData);
    if (qrData) {
      const parts = qrData.split('#');
      const maVatTu = parts[0] ? parts[0].trim() : '';
      const soLo = parts[1] ? parts[1].trim() : '';

      const detailVT = await getVTbyMaVT(maVatTu);
      // console.log('Scan item StockTake', detailVT);
      if (!maVatTu || !detailVT || !detailVT?.maVatTu) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi mã QR',
          text2: 'Định dạng mã QR không đúng (Thiếu mã vật tư)',
        });
        setShowCameraModal(false);
        return;
      }
      setLineForm(prev => ({
        ...prev,
        tenVatTu: detailVT.tenVatTu,
        maVatTu: detailVT.maVatTu,
        dvtGoc: detailVT.dvt,
        soLo: soLo,
      }));
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã điền: Mã VT [${maVatTu}] - Số lô [${soLo}]`,
      });
    }
    setShowCameraModal(false);
  };

  const handleInputChange = (field: keyof LineFormStockTake, value: any) => {
    setLineForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (status === 'NEW') {
      if (Number(lineForm.soLuongKK) <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Vui lòng nhập số lượng lớn hơn 0',
        });
        return;
      }
    } else {
      // FIX LỖI: Bỏ kiểm tra maLocator nếu bạn không dùng trường này trong UI
      if (!lineForm.maVatTu || !lineForm.soLo) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Vui lòng điền đầy đủ Mã Vật Tư và Số Lô',
        });
        return;
      }
    }

    onSubmit({
      ...lineForm,
      soLuongKK: parseFloat(lineForm.soLuongKK.toString()) || 0,
    });
    console.log('lineForm trả về detail: ', lineForm);
    handleCancel();
  };

  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <Modal animationType="slide" transparent={true} visible={open}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full">
            <View className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Header */}
              <View className="flex-row justify-between items-center py-3 px-5 border-b border-gray-100">
                <Text className="text-xl font-bold text-slate-800">
                  {status === 'NEW' ? 'Thêm dòng kiểm kê' : 'Chỉnh sửa'}
                </Text>
              </View>

              <ScrollView className="py-3 px-5 max-h-96">
                {/* <Text sr */}
                <View className="space-y-2">
                  <View className="mb-2">
                    {lineForm?.tenVatTu && (
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-slate-600 font-semibold ml-1">
                          Tên vật tư:
                        </Text>
                        <Text
                          numberOfLines={2}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                          className="text-gray-900 font-bold flex-1 text-right ml-4">
                          {lineForm.tenVatTu}
                        </Text>
                      </View>
                    )}
                    {lineForm?.maVatTu && (
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-slate-600 font-semibold ml-1">
                          Mã vật tư:
                        </Text>
                        <Text className="text-gray-900 font-bold">
                          {lineForm.maVatTu}
                        </Text>
                      </View>
                    )}
                    {lineForm?.dvtGoc && (
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-slate-600 font-semibold ml-1">
                          ĐVT gốc:
                        </Text>
                        <Text className="text-gray-900 font-bold">
                          {lineForm.dvtGoc}
                        </Text>
                      </View>
                    )}
                    <Text className="text-slate-600 font-semibold mb-2 ml-1">
                      Mã Vật Tư
                    </Text>
                    <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:border-blue-500">
                      <Pressable className="flex-1 justify-center">
                        <Text className="text-slate-800">
                          {lineForm.maVatTu
                            ? lineForm.maVatTu
                            : 'Quét mã vật tư'}
                        </Text>
                      </Pressable>
                      <View className="flex-row">
                        {settings.useCameraScan && (
                          <Pressable
                            className="px-2"
                            onPress={() => {
                              setShowCameraModal(true);
                            }}>
                            <FontAwesomeIcon
                              icon={faCamera}
                              size={18}
                              color={AppColors.primary}
                            />
                          </Pressable>
                        )}
                        <Pressable className="px-2" onPress={() => {}}>
                          <FontAwesomeIcon
                            icon={faXmark}
                            size={18}
                            color="#9ca3af"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="mb-2">
                  <Text className="text-slate-600 font-semibold mb-2 ml-1">
                    Số Lô
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-slate-800 focus:border-blue-500"
                    placeholder="Nhập số lô"
                    value={lineForm.soLo}
                    onChangeText={text => handleChangeForm('soLo', text)}
                  />
                </View>
                <View>
                  <Text className="text-slate-600 font-semibold mb-2 ml-1">
                    Số lượng kiểm kê
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-slate-800 text-2xl font-bold text-center focus:border-blue-500"
                    placeholder="0"
                    value={lineForm.soLuongKK.toString()}
                    onChangeText={text => handleNumericInput('soLuongKK', text)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </ScrollView>

              {/* Footer */}
              <View className="flex-row p-5 space-x-3 bg-gray-50">
                <Pressable
                  onPress={handleCancel}
                  className="flex-1 bg-gray-200 py-4 rounded-md active:opacity-70">
                  <Text className="text-center font-bold text-slate-700">
                    Hủy
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="flex-1 bg-emerald-600 py-4 rounded-md active:opacity-70 shadow-sm">
                  <Text className="text-center font-bold text-white">
                    Lưu dữ liệu
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </CameraScannerWrapper>
  );
};

export default StockTakeLineModal;
