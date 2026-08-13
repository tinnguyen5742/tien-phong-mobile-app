import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {ProductionShiftType} from '../type';

type ProductionShiftModalProps = {
  data: ProductionShiftType[];
  handleOpenProductionShiftModal: () => void;
  onSubmit: (data: ProductionShiftType) => void;
  open: boolean;
  title: string;
};

const ProductionShiftModal = (props: ProductionShiftModalProps) => {
  const {handleOpenProductionShiftModal, onSubmit, open, title, data} = props;

  const handleCancel = () => {
    handleOpenProductionShiftModal();
  };

  const handleSelected = (item: ProductionShiftType) => {
    onSubmit(item);
    handleOpenProductionShiftModal();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">
            {/* Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800">
                {title.toUpperCase()}
              </Text>
              <Pressable
                className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
                onPress={handleOpenProductionShiftModal}>
                <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Body */}
            <View className="p-4">
              {/* <Text style={{fontFamily: 'monospace'}} className="text-gray-900">
                {JSON.stringify(data, null, 2)}
              </Text> */}
              {data.length > 0 ? (
                <ScrollView
                  className="max-h-80"
                  showsVerticalScrollIndicator={false}>
                  {data.map((item: ProductionShiftType, index: number) => (
                    <Pressable
                      onPress={() => handleSelected(item)}
                      key={index}
                      className="flex-row items-center justify-between border border-slate-200 p-4 rounded-2xl mb-3 bg-white active:bg-cyan-50 shadow-sm">
                      <View className="flex-row items-center flex-1">
                        <Text className="font-bold text-slate-500 mr-2">
                          Mã:
                        </Text>
                        <Text className="font-bold text-cyan-700">
                          {item.maDoiTuong}
                        </Text>
                      </View>
                      <View className="flex-row items-center flex-1 justify-end">
                        <Text className="font-bold text-slate-500 mr-2">
                          Ca:
                        </Text>
                        <Text className="font-bold text-slate-700">
                          {item.tenDoiTuong}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View className="h-32 justify-center items-center">
                  <ActivityIndicator color="#0891b2" size="large" />
                  <Text className="mt-2 text-slate-400">
                    Đang tải dữ liệu...
                  </Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View className="p-5 bg-slate-50 flex-row justify-center border-t border-slate-100">
              <Pressable
                onPress={handleCancel}
                className="bg-red-500 py-3 px-10 rounded-2xl active:opacity-70 shadow-sm">
                <Text className="text-white font-bold text-center">Hủy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ProductionShiftModal;
