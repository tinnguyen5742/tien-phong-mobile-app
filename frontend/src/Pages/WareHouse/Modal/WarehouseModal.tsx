import React, { useEffect, useState, useMemo } from "react";
import { Modal, View, Text, Pressable, ScrollView, TextInput} from "react-native";
import { CustomColor } from "../../../ults";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { WarehouseType } from "../type";
import Pagination from "../../../Components/Pagination";

type WarehouseModalProps = {
    handleOpenWarehouseModal: () => void;
    open: boolean;
    warehouseList: WarehouseType[];
    handleGetWarehouse: (warehouse: WarehouseType) => void;
};

const WarehouseModal = (props: WarehouseModalProps) => {
    const { handleOpenWarehouseModal, open, warehouseList, handleGetWarehouse } = props;

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredWarehouses, setFilteredWarehouses] = useState<WarehouseType[]>(warehouseList);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    // ✅ Đồng bộ lại danh sách khi props warehouseList thay đổi
    useEffect(() => {
        setFilteredWarehouses(warehouseList);
    }, [warehouseList]);

    // ✅ Logic tìm kiếm dùng NativeWind
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const filteredData = warehouseList.filter(
            (item) =>
                item.maKho.toLowerCase().includes(text.toLowerCase()) ||
                item.tenKho.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredWarehouses(filteredData);
        setCurrentPage(1); // Reset về trang 1 khi search
    };

    const handleCancel = () => {
        handleOpenWarehouseModal();
    };

    const handleSave = (warehouse: WarehouseType) => {
        // console.log("warehouse", warehouse)
        handleGetWarehouse(warehouse);
        handleOpenWarehouseModal();
    };

    // ✅ Phân trang offline bằng slice
    const paginatedWarehouses = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredWarehouses.slice(startIndex, endIndex);
    }, [filteredWarehouses, currentPage]);

    const totalPages = Math.ceil(filteredWarehouses.length / pageSize);

    return (
        <Modal animationType="slide" transparent={true} visible={open}>
            {/* Overlay nền mờ */}
            <View className="flex-1 justify-center items-center bg-black/50">
                {/* Modal Container */}
                <View className="bg-white rounded-[30px] items-center shadow-xl w-[92%] overflow-hidden">

                    {/* ✅ Header: Dùng flex-row của NativeWind */}
                    <View className="flex-row justify-between items-center w-full p-4 border-b border-gray-100">
                        <Text className="text-lg font-bold text-gray-800">Chọn kho</Text>
                        <Pressable
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
                            onPress={handleCancel}
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="black" />
                        </Pressable>
                    </View>

                    {/* ✅ Body: Chứa Search và List */}
                    <View className="w-full px-4 py-2 h-[450px]">
                        {/* Ô Search Input */}
                        <View className="mb-3">
                            <TextInput
                                className="h-12 border border-gray-200 px-4 rounded-2xl bg-gray-50 text-gray-800"
                                placeholder="Nhập mã hoặc tên kho..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {paginatedWarehouses.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleSave(item)}
                                    className="border border-cyan-100 p-4 rounded-2xl mb-3 bg-white active:bg-cyan-50 shadow-sm"
                                    style={{ elevation: 1 }}
                                >
                                    <View className="flex-row items-center mb-1">
                                        <Text className="w-20 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mã kho</Text>
                                        <Text className="text-cyan-700 font-bold text-base">{item.maKho}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="w-20 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tên kho</Text>
                                        <Text className="text-gray-700 flex-1 font-medium" numberOfLines={1}>{item.tenKho}</Text>
                                    </View>
                                </Pressable>
                            ))}

                            {/* Trường hợp không có dữ liệu */}
                            {filteredWarehouses.length === 0 && (
                                <View className="py-20 items-center">
                                    <Text className="text-gray-400 italic">Không tìm thấy kho nào...</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* ✅ Footer: Tái sử dụng Component Pagination */}
                    <View className="w-full border-t border-gray-50">
                        <Pagination
                            page={currentPage}
                            totalPage={totalPages}
                            onPageChange={(newPage) => setCurrentPage(newPage)}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default WarehouseModal;