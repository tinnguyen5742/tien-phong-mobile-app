import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {LineLotType, ChangeLocationWarehouseSubmitType} from '../type';
import {AppColors} from '../../../../colors';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Toast from 'react-native-toast-message';

type ChangeLocationWarehouseLineModalProps = {
  data: LineLotType;
  handleOpenChangeLocationWarehouseLineModal: () => void;
  onSubmit: (data: any) => void;
  open: boolean;
  title: string;
};

const ChangeLocationWarehouseLineModal = (
  props: ChangeLocationWarehouseLineModalProps,
) => {
  // ✅ Bẫy lỗi 1: Trạng thái khởi tạo an toàn nếu props.slxuat hoặc props.note bị undefined
  const [dataSubmit, setDataSubmit] = useState<LineLotType>({} as LineLotType);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🌟 BƯỚC KHÓA LỖI: Nếu modal đang đóng (props.open === false) thì THOÁT NGAY, không chạy logic bên dưới nữa
    if (!props.open || !props.data) return;

    // 🌟 BƯỚC CẮT ĐỨT THAM CHIẾU: Biến rawData thành một bản sao hoàn toàn độc lập, không chung ô nhớ với trang cha
    const rawData = JSON.parse(
      JSON.stringify(Array.isArray(props.data) ? props.data[0] : props.data),
    );

    console.log('>>> [Modal] Dữ liệu đã cô lập an toàn:', rawData);
    // --- Toàn bộ đoạn code let maVatTu, so Lo và setDataSubmit bên dưới của bạn giữ nguyên vẹn ---
    let maVatTu = rawData.maVT || '';
    let soLo = rawData.soLoID || '';

    if (rawData.qrCode && typeof rawData.qrCode === 'string') {
      const parts = rawData.qrCode.split('#');
      maVatTu = parts[0] || maVatTu;
      soLo = parts[1] || soLo;
    }
    // if (maVatTu) {
    //     handleGetDVT(maVatTu);
    // }

    setDataSubmit({
      maVT: maVatTu,
      soLoID: soLo,
      maLot: rawData.maLot,
      viTriNhap: rawData.viTriNhap || '',
      viTriXuat: rawData.viTriXuat || '',
      slXuat: rawData.slXuat ?? 0,
      tenVT: rawData.tenVT || '',
      dvt: rawData.dvt || '',
      khoXuat: rawData.khoXuat || '',
      khoNhap: rawData.khoNhap || '',
      ghiChu: rawData.ghiChu ?? '',
    });
  }, [props.data, props.open]); // Giữ nguyên mảng dependency

  const handleInputChange = (fieldName: string, text: string) => {
    setDataSubmit((prevValues: any) => ({
      ...prevValues,
      [fieldName]: text,
    }));
  };

  const handleNumericInput = (key: string, text: string) => {
    // Bẫy lỗi nhập liệu: chỉ chấp nhận số và dấu chấm
    const decimalRegex = /^\d*\.?\d*$/;
    if (decimalRegex.test(text)) {
      handleInputChange(key, text);
    }
  };

  const handleSave = () => {
    // Bẫy lỗi: Đảm bảo dữ liệu gửi về có đầy đủ các trường quan trọng
    const finalData = {
      ...dataSubmit,
      slXuat: Number(dataSubmit.slXuat) || 0,
      ghiChu: dataSubmit.ghiChu,
    };

    console.log('>>> [Modal] Dữ liệu gửi về cho Detail:', finalData);

    if (typeof props?.onSubmit === 'function') {
      props.onSubmit(finalData);
    }

    if (
      typeof props?.handleOpenChangeLocationWarehouseLineModal === 'function'
    ) {
      props.handleOpenChangeLocationWarehouseLineModal();
    }
  };

  const handlecancel = () => {
    if (
      typeof props?.handleOpenChangeLocationWarehouseLineModal === 'function'
    ) {
      props.handleOpenChangeLocationWarehouseLineModal();
    }
  };

  // ✅ Bẫy lỗi 4: Nếu props.open không có, không render modal để tránh lỗi logic
  if (!props?.open) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={props.open}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">
            {/* Header với Optional Chaining an toàn */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100 relative">
              <Text className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                {(props?.title ?? 'Thông tin').toUpperCase()}
              </Text>
            </View>

            {loading ? (
              <View className="py-20 justify-center items-center">
                <ActivityIndicator size="large" color={AppColors.primary} />
                <Text className="mt-2 text-slate-400 italic">
                  Đang tải thông tin vật tư...
                </Text>
              </View>
            ) : (
              <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                                    {JSON.stringify(props, null, 2)}
                                </Text> */}
                <View className="pb-6 space-y-3">
                  <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Mã VT:
                      </Text>
                      <Text className="text-sm font-bold text-cyan-700">
                        {dataSubmit?.maVT || '---'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Tên VT:
                      </Text>
                      <Text
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                        className="text-sm font-medium text-slate-700 flex-1 text-right ml-4">
                        {dataSubmit?.tenVT || 'Chưa có tên'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Số lô:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.soLoID || '---'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        ĐVT:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.dvt || '---'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Kho:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.khoXuat || '---'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Vị trí xuất:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.viTriXuat || '---'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Vị trí nhập:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.viTriNhap || '---'}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">
                      Số lượng xuất
                    </Text>
                    <TextInput
                      className="h-12 border border-slate-200 rounded-xl px-4 bg-slate-50 text-slate-900 font-bold text-lg text-left focus:border-cyan-500"
                      value={dataSubmit?.slXuat?.toString() ?? '0'}
                      keyboardType="numeric"
                      onChangeText={text => handleNumericInput('slXuat', text)}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">
                      Ghi chú
                    </Text>
                    <TextInput
                      className="h-20 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 text-slate-800 text-sm align-top focus:border-cyan-500"
                      placeholder="Nhập ghi chú (nếu có)..."
                      value={dataSubmit?.ghiChu?.toString() ?? ''}
                      multiline={true}
                      onChangeText={text => handleInputChange('ghiChu', text)}
                    />
                  </View>
                </View>
              </ScrollView>
            )}

            <View className="flex-row p-5 bg-slate-50 border-t border-slate-100 space-x-3">
              <Pressable
                onPress={handlecancel}
                className="flex-1 bg-red-500 py-4 rounded-md active:opacity-80 shadow-sm">
                <Text className="text-white font-bold text-center">Hủy</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 bg-emerald-600 py-4 rounded-md active:opacity-80 shadow-sm">
                <Text className="text-white font-bold text-center">
                  Lưu lại
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ChangeLocationWarehouseLineModal;
