import React from "react";
import { Modal, View, Text, Pressable, ScrollView, } from "react-native";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ProductSemiProductType } from "../type";

type ProductSemiProductProps = {
    data: ProductSemiProductType[];
    handleProductSemiProductModal: () => void;
    open: boolean;
    handleGetValue: (value: ProductSemiProductType) => void;
};

const ProductSemiProductModal = (props: ProductSemiProductProps) => {
    const {
        data,
        handleProductSemiProductModal,
        open,
        handleGetValue
    } = props;

    const handleCancel = () => {
        handleProductSemiProductModal();
    };

    const TextLine = (label: string, value: string) => (
        <View className="flex-row justify-between items-center mb-1">
            <Text className="text-slate-500 text-xs italic">{label}:</Text>
            <Text className="text-slate-800 font-bold text-xs flex-1 text-right ml-2" numberOfLines={1}>
                {value || "---"}
            </Text>
        </View>
    );

    return (
        <Modal animationType="slide" transparent={true} visible={open}>
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                        <Text className="text-lg font-bold text-slate-800">
                            DANH SÁCH BTP/TP
                        </Text>
                        <Pressable
                            onPress={handleCancel}
                            className="p-2 active:bg-slate-100 rounded-full"
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Body */}
                    <View className="h-80 w-full px-2 pt-2">
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {data && data.length > 0 ? (
                                data.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => handleGetValue(item)}
                                        className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-3 active:bg-cyan-50 active:border-cyan-200 shadow-sm"
                                    >
                                        {TextLine("Mã vật tư", item.maTP)}
                                        {TextLine("Tên vật tư", item.tenVatTu)}
                                        {TextLine("DVT", item.dvt)}
                                        {/* Bạn có thể thêm các trường khác nếu cần */}
                                    </Pressable>
                                ))
                            ) : (
                                <View className="py-20 items-center">
                                    <Text className="text-slate-400 italic">Không có dữ liệu vật tư</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <View className="p-5 bg-slate-50 border-t border-slate-100 flex-row justify-center">
                        <Pressable
                            onPress={handleCancel}
                            className="bg-red-500 py-3 px-12 rounded-md active:opacity-70 shadow-sm"
                        >
                            <Text className="text-white font-bold text-center">Hủy</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ProductSemiProductModal;