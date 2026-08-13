import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {FormSearchListProduceType} from '../type';
import {useColorScheme} from 'nativewind';

type SeachModalType = {
  handleOpenSeachModal: () => void;
  onSubmit: (data: FormSearchListProduceType) => void;
  open: boolean;
  title: string;
};

const SeachModal = (props: SeachModalType) => {
  const {colorScheme} = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const {handleOpenSeachModal, onSubmit, open, title} = props;
  const [search, setSearch] = useState<FormSearchListProduceType>({
    LSX: '',
  });

  const handleChangeText = (name: string, value: string) => {
    setSearch({
      ...search,
      [name]: value,
    });
  };

  const OnSearch = () => {
    onSubmit(search);
    handleOpenSeachModal();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={handleOpenSeachModal}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full">
            {/* Container đồng bộ bo góc 30px */}
            <View className="bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
              {/* Header */}
              <View className="flex-row justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
                <Text className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {title}
                </Text>
                <Pressable
                  onPress={handleOpenSeachModal}
                  className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700">
                  <FontAwesomeIcon
                    icon={faXmark}
                    size={20}
                    color={isDarkMode ? '#cbd5e1' : '#64748b'}
                  />
                </Pressable>
              </View>

              {/* Body */}
              <View className="p-6">
                <View>
                  <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">
                    Mã Lệnh Sản Xuất (LSX)
                  </Text>
                  <TextInput
                    className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-slate-900 dark:text-white font-bold text-lg focus:border-cyan-500"
                    placeholder="Nhập mã LSX..."
                    placeholderTextColor="#94a3b8"
                    onChangeText={text => handleChangeText('LSX', text)}
                    value={search.LSX}
                    autoFocus={true}
                    // Giúp công nhân nhập liệu nhanh hơn
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Footer - Đồng bộ nút Hủy/Tìm kiếm */}
              <View className="flex-row p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-x-3">
                <Pressable
                  onPress={handleOpenSeachModal}
                  className="flex-1 h-14 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700 active:opacity-70">
                  <Text className="text-slate-700 dark:text-slate-200 font-bold text-base">
                    Hủy
                  </Text>
                </Pressable>

                <Pressable
                  onPress={OnSearch}
                  className="flex-[2] h-14 items-center justify-center rounded-2xl bg-primary active:bg-primary shadow-sm">
                  <Text className="font-bold text-white text-base">
                    Tìm kiếm
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SeachModal;
