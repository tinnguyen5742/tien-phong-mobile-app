import React, {useEffect, useState} from 'react';
import {Modal, View, Text, Pressable, TextInput} from 'react-native';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {KetLuanType, LineFormQualityControl} from '../type';

type ResultModalType = {
  data?: LineFormQualityControl;
  handleResultModal: () => void;
  open: boolean;
  handleGetValue?: (value: KetLuanType) => void; // 🌟 Thêm dấu "?" vào đây
  onSubmit: (data: any) => void;
};

const ResultModal = (props: ResultModalType) => {
  const {data, handleResultModal, open, onSubmit, handleGetValue} = props;

  const KetLuanData: KetLuanType[] = [
    {ketLuan: 'KD', ketLuanText: 'Không đạt'},
    {ketLuan: 'D', ketLuanText: 'Đạt'},
  ];
  const [ketQuaText, setKetQuaText] = useState('');

  useEffect(() => {
    if (open) {
      // Nếu props.data có kết quả cũ thì nạp vào state, không thì để chuỗi rỗng
      setKetQuaText(data?.ketQua ? String(data.ketQua) : '');
    }
  }, [open, data?.ketQua]);

  const handleCancel = () => {
    handleResultModal();
  };

  const handleSave = (ketLuan: KetLuanType, ketQuaText: string) => {
    // 1. Đóng gói đầy đủ data của chỉ tiêu hiện tại kèm theo kết quả vừa chọn
    const updatedData = {
      ...data, // Hoặc props.data
      ketQua: ketQuaText, // Kết quả nhập vào
      ketLuanText: ketLuan.ketLuanText,
      ketLuan: ketLuan.ketLuan,
    };

    console.log('🚀 Dữ liệu mới nhất gửi về trang chính:', updatedData);
    // 2. Bắn ngược kết quả ra hàm onSubmit ở trang chính
    onSubmit(updatedData);

    // 3. Tự động đóng modal sau khi chọn xong để tạo trải nghiệm mượt mà
    handleCancel();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={open}>
      {/* Overlay nền mờ */}
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        {/* Modal Container */}
        <View className="bg-white rounded-[30px] w-full max-w-sm shadow-2xl overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
            <Text className="text-xl font-bold text-slate-800">Đánh giá</Text>
            <Pressable
              onPress={handleCancel}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100">
              <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Body - List of Options */}
          <View className="p-4">
            {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                            {JSON.stringify(props.data, null, 2)}
                        </Text> */}
            <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
              <View className="mb-2">
                <Text className="text-xs font-bold text-slate-400 uppercase">
                  Tên chỉ tiêu:
                </Text>
                <Text className="text-sm font-bold text-cyan-700">
                  {props.data?.tenChiTieuCon || '---'}
                </Text>
              </View>
              <View className="mb-2">
                <Text className="text-xs font-bold text-slate-400 uppercase">
                  Tiêu chuẩn:
                </Text>
                <Text className="text-sm font-medium text-slate-700">
                  {props.data?.tieuChuan || 'Chưa có tên'}
                </Text>
              </View>
              {/* <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-xs font-bold text-slate-400 uppercase">Phương pháp đo:</Text>
                                <Text className="text-sm font-medium text-slate-700 flex-1 text-right ml-4" numberOfLines={1}>
                                    {props.data?.phuongPhapDo || "Chưa có tên"}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-xs font-bold text-slate-400 uppercase">Đơn vị đo:</Text>
                                <Text className="text-sm font-medium text-slate-700 flex-1 text-right ml-4" numberOfLines={1}>
                                    {props.data?.donViDo || "Chưa có tên"}
                                </Text>
                            </View> */}
              {/* <View className="py-2">
                                <Text className="text-gray-600 font-medium w-24 mt-2">Kết quả</Text>
                                    <TextInput
                                        className="flex-1 bg-white border border-gray-300 rounded-lg text-gray-800"
                                        onChangeText={(text) => setKetQuaText(text)} // ✅ Cập nhật state khi gõ chữ
                                    value={ketQuaText} /> 
                            </View> */}

              <View className="py-1">
                <Text className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Kết quả:
                </Text>

                <TextInput
                  className="bg-white border border-gray-300 rounded-lg p-2 min-h-[60px] text-gray-600"
                  multiline={true}
                  placeholder="Nhập kết quả"
                  onChangeText={text => setKetQuaText(text)}
                  value={ketQuaText}
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              {KetLuanData.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleSave(item, ketQuaText)}
                  className="w-[48%] border border-slate-200 bg-white p-5 rounded-2xl active:bg-cyan-50 active:border-cyan-200 shadow-sm flex-row justify-center items-center">
                  <Text className="text-base font-bold text-slate-700">
                    {item.ketLuanText}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Footer - Padding đáy cho thoáng */}
          <View className="pb-2" />
        </View>
      </View>
    </Modal>
  );
};

export default ResultModal;
