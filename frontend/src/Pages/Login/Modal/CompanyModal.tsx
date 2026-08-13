import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import {
  faXmark,
  faBuilding,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

// Danh sách danh mục công ty/chi nhánh mẫu
const COMPANY_LIST = [{ id: "TIENPHONGNAM", name: "TIENPHONGNAM" }];

type CompanyModalProps = {
  open: boolean;
  title?: string;
  selectedTenant?: string;
  onSelectCompany: (companyName: string) => void;
  onClose: () => void;
};

const CompanyModal = ({
  open,
  title = "Chọn công ty",
  selectedTenant,
  onSelectCompany,
  onClose,
}: CompanyModalProps) => {
  const handleSelect = (companyName: string) => {
    onSelectCompany(companyName);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={onClose}
    >
      {/* Overlay nền mờ */}
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        {/* Modal Container */}
        <View className="bg-white rounded-[30px] w-full max-w-sm shadow-2xl overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
            <Text className="text-xl font-bold text-slate-800">{title}</Text>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100"
            >
              <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Body - Danh sách các công ty */}
          <ScrollView className="p-4 max-h-80">
            {COMPANY_LIST.map((item) => {
              const isSelected = selectedTenant === item.name;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelect(item.name)}
                  className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${
                    isSelected
                      ? "bg-red-50 border-red-400"
                      : "bg-slate-50 border-slate-100 active:bg-slate-100"
                  }`}
                >
                  <View className="flex-row items-center space-x-3 flex-1 mr-2">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      size={18}
                      color={isSelected ? "#f87171" : "#94a3b8"}
                    />
                    <Text
                      className={`text-base font-semibold ${
                        isSelected ? "text-red-500" : "text-slate-700"
                      }`}
                    >
                      {item.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <FontAwesomeIcon icon={faCheck} size={16} color="#f87171" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View className="pb-3" />
        </View>
      </View>
    </Modal>
  );
};

export default CompanyModal;
