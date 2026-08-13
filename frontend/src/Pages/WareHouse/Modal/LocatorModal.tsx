import React, { useEffect, useState, useMemo } from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    ScrollView,
    TextInput,
} from "react-native";
import { CustomColor } from "../../../ults";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { LocatorType } from "../type";
import Pagination from "../../../Components/Pagination";

type LocatorModalProps = {
    handleOpenLocatorModal: () => void;
    open: boolean;
    locatorList: LocatorType[];
    handleGetLocator: (warehouse: LocatorType) => void;
};

const LocatorModal = (props: LocatorModalProps) => {
    const {
        handleOpenLocatorModal,
        open,
        locatorList,
        handleGetLocator
    } = props;

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredLocator, setFilteredLocator] = useState<LocatorType[]>(locatorList);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Cập nhật danh sách khi props thay đổi
    useEffect(() => {
        setFilteredLocator(locatorList);
    }, [locatorList]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const filteredData = locatorList.filter(
            (item) =>
                item.maLocator.toLowerCase().includes(text.toLowerCase()) ||
                item.tenLocator.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredLocator(filteredData);
        setCurrentPage(1);
    };

    const paginatedLocator = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredLocator.slice(startIndex, endIndex);
    }, [filteredLocator, currentPage]);

    const totalPages = Math.ceil(filteredLocator.length / pageSize);

    const handleCancel = () => {
        handleOpenLocatorModal();
    };

    const handleSave = (locator: LocatorType) => {
        handleGetLocator(locator);
        handleOpenLocatorModal();
    };

    return (
        <Modal animationType="slide" transparent={true} visible={open}>
            <View className="flex-1 justify-center items-center bg-black/50 px-4">
                <View className="bg-white rounded-[30px] items-center shadow-xl w-full max-w-sm overflow-hidden">

                    {/* Header */}
                    <View className="flex-row justify-between items-center w-full p-4 border-b border-gray-100">
                        <Text className="text-lg font-bold text-slate-800">Chọn vị trí</Text>
                        <Pressable
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
                            onPress={handleCancel}
                        >
                            <FontAwesomeIcon icon={faXmark} size={20} color="black" />
                        </Pressable>
                    </View>

                    {/* Body */}
                    <View className="mt-2 w-full px-4 h-80">
                        <View className="mb-3">
                            <TextInput
                                className="h-11 border border-gray-200 px-4 rounded-xl bg-gray-50 text-slate-800"
                                placeholder="Tìm kiếm theo mã locator hoặc tên..."
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {paginatedLocator.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleSave(item)}
                                    className="border border-cyan-100 p-4 rounded-2xl mb-3 bg-white active:bg-cyan-50 shadow-sm"
                                >
                                    <View className="flex-row items-center mb-1">
                                        <Text className="w-24 text-xs font-semibold text-slate-400 uppercase">Mã locator:</Text>
                                        <Text className="text-cyan-700 font-bold">{item.maLocator}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="w-24 text-xs font-semibold text-slate-400 uppercase">Tên locator:</Text>
                                        <Text className="text-slate-700 flex-1 font-medium" numberOfLines={1}>{item.tenLocator}</Text>
                                    </View>
                                </Pressable>
                            ))}

                            {filteredLocator.length === 0 && (
                                <View className="py-10 items-center">
                                    <Text className="text-slate-400 italic">Không tìm thấy vị trí phù hợp</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Footer Phân trang đồng bộ */}
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

export default LocatorModal;