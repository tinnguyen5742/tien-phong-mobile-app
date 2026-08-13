import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {CustomColor, device} from '../../../ults';
import {api_url} from '../../../Base/api/api_service';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Toast from 'react-native-toast-message';

type WarehouseQRScanModalProps = {
  data: any;
  handleOpenWarehouseQRScanModal: () => void;
  onSubmit: (data: any) => void;
  open: boolean;
  title: string;
};

const WarehouseQRScanModal = (props: WarehouseQRScanModalProps) => {
  // console.log('props.data: ', props.data);

  // ✅ GIỮ NGUYÊN HOÀN TOÀN LOGIC STATE KHỞI TẠO CỦA BẠN
  const [dataSubmit, setDataSubmit] = useState({
    Item_Id: props.data.Item_Id,
    Item_Code: props.data.Item_Code,
    Item_Name: props.data.Item_Name,
    Item_Long_Name: props.data.Item_Long_Name,
    Uom_Code: props.data.Uom_Code,
    Uom_Name: props.data.Uom_Name,
    Uom_Code2: props.data.Uom_Code2,
    Uom_Name2: props.data.Uom_Name2,
    Conv_Fact: props.data.Conv_Fact,
    Lot_Code: props.data.Lot_Code,
    Lot_Qty: props.data.Lot_Qty,
    Lot_Qty2: props.data.Lot_Qty2,
    ViTriXuat: props.data.ViTriXuat,
  });

  // ✅ GIỮ NGUYÊN LOGIC CẬP NHẬT KHI PROPS DATA THAY ĐỔI
  useEffect(() => {
    setDataSubmit({
      Item_Id: props.data.Item_Id,
      Item_Code: props.data.Item_Code,
      Item_Name: props.data.Item_Name,
      Item_Long_Name: props.data.Item_Long_Name,
      Uom_Code: props.data.Uom_Code,
      Uom_Name: props.data.Uom_Name,
      Uom_Code2: props.data.Uom_Code2,
      Uom_Name2: props.data.Uom_Name2,
      Conv_Fact: props.data.Conv_Fact,
      Lot_Code: props.data.Lot_Code,
      Lot_Qty: props.data.Lot_Qty,
      Lot_Qty2: props.data.Lot_Qty2,
      ViTriXuat: props.data.ViTriXuat,
    });
  }, [props.data]);

  // ✅ GIỮ NGUYÊN HÀM XỬ LÝ INPUT
  const handleInputChange = (fieldName: any, text: any) => {
    setDataSubmit(prev => ({
      ...prev,
      [fieldName]: text,
    }));
  };

  const handleSave = () => {
    props.onSubmit(dataSubmit);
    props.handleOpenWarehouseQRScanModal();
  };

  const handleCancel = () => {
    props.handleOpenWarehouseQRScanModal();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={props.open}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full max-w-md">
            <View className="bg-white rounded-[30px] shadow-2xl overflow-hidden">
              {/* Header */}
              <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                <Text className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                  {props.title}
                </Text>
                <Pressable
                  onPress={handleCancel}
                  className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100">
                  <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                </Pressable>
              </View>

              {/* Body */}
              <ScrollView
                className="p-5 max-h-[500px]"
                showsVerticalScrollIndicator={false}>
                <View className="space-y-4">
                  {/* Thông tin vật tư quét được (Read-only UI) */}
                  <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        Mã hàng:
                      </Text>
                      <Text className="text-sm font-bold text-cyan-700">
                        {dataSubmit.Item_Code}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-slate-400 uppercase mb-1">
                        Tên hàng:
                      </Text>
                      <Text className="text-sm font-medium text-slate-700">
                        {dataSubmit.Item_Name}
                      </Text>
                    </View>
                    <View className="flex-row justify-between pt-2 border-t border-slate-200">
                      <View>
                        <Text className="text-xs font-bold text-slate-400 uppercase">
                          Số lô:
                        </Text>
                        <Text className="text-sm font-bold text-slate-800">
                          {dataSubmit.Lot_Code}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs font-bold text-slate-400 uppercase">
                          ĐVT:
                        </Text>
                        <Text className="text-sm font-bold text-slate-800">
                          {dataSubmit.Uom_Name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Phần nhập liệu số lượng */}
                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">
                        Số lượng
                      </Text>
                      <TextInput
                        className="h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-bold text-lg focus:border-cyan-500"
                        value={dataSubmit.Lot_Qty?.toString()}
                        onChangeText={text =>
                          handleInputChange('Lot_Qty', text)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">
                        Vị trí xuất
                      </Text>
                      <TextInput
                        className="h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:border-cyan-500"
                        value={dataSubmit.ViTriXuat}
                        onChangeText={text =>
                          handleInputChange('ViTriXuat', text)
                        }
                        placeholder="Vị trí..."
                      />
                    </View>
                  </View>

                  {/* Đơn vị 2 (nếu có) */}
                  {dataSubmit.Uom_Name2 && (
                    <View>
                      <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">
                        Số lượng ({dataSubmit.Uom_Name2})
                      </Text>
                      <TextInput
                        className="h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:border-cyan-500"
                        value={dataSubmit.Lot_Qty2?.toString()}
                        onChangeText={text =>
                          handleInputChange('Lot_Qty2', text)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                </View>
                <View className="h-6" />
              </ScrollView>

              {/* Footer */}
              <View className="flex-row p-5 bg-slate-50 border-t border-slate-100 space-x-3">
                <Pressable
                  onPress={handleCancel}
                  className="flex-1 h-12 items-center justify-center rounded-2xl bg-slate-200 active:opacity-70">
                  <Text className="text-slate-600 font-bold">Hủy</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="flex-[2] h-12 items-center justify-center rounded-2xl bg-primary active:bg-primary shadow-sm">
                  <Text className="text-white font-bold">Xác nhận</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default WarehouseQRScanModal;
