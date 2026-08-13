import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { faXmark, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MFNongType } from "../type";
import { loadingStore } from "../../../Store/loadingStore";
import { useSetRecoilState } from "recoil";

type MFNongModalListProps = {
  data: MFNongType[];
  handleOpenMFNongModalList: () => void;
  onSubmit: (data: MFNongType) => void;
  open: boolean;
  title: string;
};

const MFNongModalList = (props: MFNongModalListProps) => {
  const { data, handleOpenMFNongModalList, onSubmit, open, title } = props;
  const setLoadingAtom = useSetRecoilState(loadingStore);

  // State lưu từ khóa tìm kiếm
  const [searchText, setSearchText] = useState("");

  const handlecancel = () => {
    handleOpenMFNongModalList();
  };

  const handleChoseCaSx = (item: MFNongType) => {
    onSubmit(item);
    handleOpenMFNongModalList();
  };

  // Lọc dữ liệu theo MachineCode HOẶC MachineName
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data;

    const keyword = searchText.toLowerCase().trim();
    return data.filter((item) => {
      const codeMatch = item?.MachineCode?.toLowerCase().includes(keyword);
      const nameMatch = item?.MachineName?.toLowerCase().includes(keyword);
      return codeMatch || nameMatch;
    });
  }, [data, searchText]);

  return (
    <Modal animationType="slide" transparent={true} visible={props.open}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden h-[85%]">
            {/* Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                {title}
              </Text>
              <Pressable
                className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
                onPress={handleOpenMFNongModalList}
              >
                <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Body */}
            <View className="p-4 flex-1">
              {/* Ô Search Đơn Giản */}
              <View className="flex-row items-center bg-slate-100 rounded-2xl px-3.5 py-2.5 mb-3 border border-slate-200">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  size={16}
                  color="#94a3b8"
                />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search by machine code or name..."
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-2 text-sm text-slate-800 p-0"
                />
                {searchText !== "" && (
                  <Pressable onPress={() => setSearchText("")} className="p-1">
                    <FontAwesomeIcon icon={faXmark} size={14} color="#94a3b8" />
                  </Pressable>
                )}
              </View>

              {/* Danh sách Data */}
              {filteredData.length > 0 ? (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="h-full"
                >
                  {filteredData.map((item: MFNongType, index: number) => (
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
                          {item?.MachineCode}
                        </Text>
                      </View>
                      <View className="flex-row items-center mb-1">
                        <Text className="w-24 text-xs font-bold text-slate-400 uppercase">
                          Descr:
                        </Text>
                        <Text className="flex-1 font-bold text-slate-700 text-sm">
                          {item?.MachineName}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
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

export default MFNongModalList;
