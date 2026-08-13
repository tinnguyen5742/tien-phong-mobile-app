import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-native";
import { CustomColor } from "../../../ults";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Toast from "react-native-toast-message";
import { TypeFormQCDetail } from "../type";
import { AppColors } from "../../../../colors";

type QCLineModalProps = {
  data: TypeFormQCDetail;
  handleOpenQCLineModal: () => void;
  onSubmit: (data: any) => void;
  open: boolean;
  title: string;
};

const QCLineModal = (props: QCLineModalProps) => {
  // ✅ Bẫy lỗi 1: Trạng thái khởi tạo an toàn nếu props.slxuat hoặc props.note bị undefined
  const [dataSubmit, setDataSubmit] = useState<TypeFormQCDetail>(
    {} as TypeFormQCDetail,
  );

  useEffect(() => {
    setDataSubmit(props.data);
  }, [props.data]);

  const [loading, setLoading] = useState(false);

  const handleInputChange = (fieldName: string, text: string) => {
    setDataSubmit((prevValues: any) => ({
      ...prevValues,
      [fieldName]: text,
    }));
  };

  const handleSave = () => {
    if (!dataSubmit) {
      Alert.alert("Thông báo", "Vui lòng kiểm tra lại dữ liệu.");
      return;
    }

    // CHỈ CẦN GỌI onSubmit, để component cha tự đóng Modal sau khi lưu thành công
    if (typeof props?.onSubmit === "function") {
      props.onSubmit(dataSubmit);
    }
  };

  const handlecancel = () => {
    if (typeof props?.handleOpenQCLineModal === "function") {
      props.handleOpenQCLineModal();
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
                {(props?.title ?? "Thông tin").toUpperCase()}
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
                <View className="pb-6 space-y-3">
                  {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                                        {JSON.stringify(dataSubmit, null, 2)}
                                    </Text> */}

                  <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        TestingCriteriaID:
                      </Text>
                      <Text
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                        className="text-sm font-medium text-slate-700 flex-1 text-right ml-4"
                      >
                        {dataSubmit?.TestingCriteriaID || "---"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        TestingCriteriaLineID:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.TestingCriteriaLineID || "---"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        TestCriteria:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.TestCriteria || "---"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        TestCriteriaName:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.TestCriteriaName || "---"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-xs font-bold text-slate-400 uppercase">
                        StandardValue:
                      </Text>
                      <Text className="text-sm font-bold text-slate-700">
                        {dataSubmit?.StandardValue || "---"}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">
                      Result
                    </Text>
                    <TextInput
                      className="h-12 border border-slate-200 rounded-xl px-4 bg-slate-50 text-slate-900 font-bold text-md text-left focus:border-cyan-500"
                      value={dataSubmit?.Result}
                      onChangeText={(text) => handleInputChange("Result", text)}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-slate-500 mb-1.5 ml-1">
                      Description
                    </Text>
                    <TextInput
                      className="h-20 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 text-slate-800 text-sm align-top focus:border-cyan-500"
                      placeholder="Enter description..."
                      value={dataSubmit?.Description?.toString() ?? ""}
                      multiline={true}
                      onChangeText={(text) =>
                        handleInputChange("Description", text)
                      }
                    />
                  </View>
                </View>
              </ScrollView>
            )}

            <View className="flex-row p-5 bg-slate-50 border-t border-slate-100 space-x-3">
              <Pressable
                onPress={handlecancel}
                className="flex-1 bg-red-500 py-4 rounded-md active:opacity-80 shadow-sm"
              >
                <Text className="text-white font-bold text-center">Cancle</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 bg-emerald-600 py-4 rounded-md active:opacity-80 shadow-sm"
              >
                <Text className="text-white font-bold text-center">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default QCLineModal;
