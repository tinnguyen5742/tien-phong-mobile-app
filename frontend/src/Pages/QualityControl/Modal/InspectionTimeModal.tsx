import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { InspectionTimeType } from "../type";
import { loadingStore } from "../../../Store/loadingStore";
import { useSetRecoilState } from "recoil";

type InspectionTimeModalListProps = {
  data: InspectionTimeType[];
  handleOpenInspectionTimeModalList: () => void;
  onSubmit: (data: InspectionTimeType) => void;
  open: boolean;
  title: string;
};

const InspectionTimeModalList = (props: InspectionTimeModalListProps) => {
  const { data, handleOpenInspectionTimeModalList, onSubmit, open, title } =
    props;
  const setLoadingAtom = useSetRecoilState(loadingStore);

  const handlecancel = () => {
    handleOpenInspectionTimeModalList();
  };

  const handleChoseCaSx = (item: InspectionTimeType) => {
    onSubmit(item);
    handleOpenInspectionTimeModalList();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={props.open}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">
            {/* Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                {title}
              </Text>
              <Pressable
                className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
                onPress={handleOpenInspectionTimeModalList}
              >
                <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Body */}
            <View className="p-4">
              {data.length > 0 ? (
                <View className="h-80">
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {data.map((item: InspectionTimeType, index: number) => (
                      <Pressable
                        onPress={() => handleChoseCaSx(item)}
                        key={index}
                        className="border border-slate-200 p-4 rounded-2xl mb-3 bg-white active:bg-cyan-50 shadow-sm"
                      >
                        <View className="flex-row items-center mb-1">
                          <Text className="w-24 text-xs font-bold text-slate-400 uppercase">
                            Code:
                          </Text>
                          <Text
                            className="flex-1 font-bold text-cyan-700 text-sm"
                            numberOfLines={1}
                          >
                            {item?.Code}
                          </Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                          <Text className="w-24 text-xs font-bold text-slate-400 uppercase">
                            Descr:
                          </Text>
                          <Text className="flex-1 font-bold text-slate-700 text-sm">
                            {item?.Descr}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View className="h-32 justify-center items-center">
                  <Text className="mt-2 text-slate-400 italic">
                    No data found
                  </Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View className="p-5 bg-slate-50 flex-row justify-center border-t border-slate-100">
              <Pressable
                onPress={handlecancel}
                className="bg-red-500 py-3 px-12 rounded-md active:opacity-70 shadow-sm"
              >
                <Text className="text-white font-bold text-center">Cancle</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default InspectionTimeModalList;
