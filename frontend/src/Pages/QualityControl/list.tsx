import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import HeaderComponent from "../../Base/HeaderComponent/headerComponent";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowsRotate,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { CustomColor, formatDate, formatTime } from "../../ults";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loadingStore } from "../../Store/loadingStore";
import { TypeFormQCHeader } from "./type";
import Toast from "react-native-toast-message";
import { getApi, postApi, deleteApi } from "../../Base/api/api_service__";
import {
  QualityControlDetailAtom,
  QualityControlDetailID,
  QualityControlStatusTypeAtom,
} from "./store";
import GeneralTable, { TableColumn } from "../../Components/GeneralTable";
import Pagination from "../../Components/Pagination";
import { AppColors } from "../../../colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const QualityControlList = () => {
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setQualityControlStatusTypeAtom = useSetRecoilState(
    QualityControlStatusTypeAtom,
  );
  const setQualityControlDetailAtom = useSetRecoilState(
    QualityControlDetailAtom,
  );
  const setQualityControlDetailID = useSetRecoilState(QualityControlDetailID);
  const navigate = useNavigation();

  const [list, setList] = useState<TypeFormQCHeader[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  //#region Table Config
  const columns: TableColumn[] = [
    { name: "STT", label: "No", width: 50 },
    { name: "TestingNbr", label: "TestingNbr", width: 120 },
    { name: "InventoryCD", label: "InventoryCD", width: 120 },
    { name: "ProductionStandard", label: "ProductionStandard", width: 200 },
    { name: "InspectionTime", label: "InspectionTime", width: 120 },
    { name: "TestingDate", label: "TestingDate", width: 120 },
    { name: "Description", label: "Description", width: 200 },
    { name: "Conclude", label: "Conclude", width: 100 },
    // { name: "Actions_Right", label: "Xóa", width: 50 },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "STT",
    "TestingNbr",
    "InventoryCD",
    "ProductionStandard",
    "InspectionTime",
    "TestingDate",
    "Description",
    "Conclude",
    "Actions_Right",
  ]);

  // Hàm xử lý hiển thị cell đặc biệt
  const renderCustomCell = (columnName: string, item: any) => {
    if (columnName === "TestingNbr") {
      return (
        <Text className="text-gray-700 font-medium">{item.TestingNbr}</Text>
      );
    }
    if (columnName === "tinhTrang") {
      if (item.tinhTrang === "draft") {
        return <Text className="font-semibold text-accent">Lưu tạm</Text>;
      }
      if (item.tinhTrang === "complete") {
        return <Text className="font-semibold text-green-500">Hoàn thành</Text>;
      }
      return <Text className="text-gray-700">{item.tinhTrang}</Text>;
    }
    if (columnName === "TestingDate") {
      return (
        <Text className="text-gray-700">
          {formatDate(new Date(item.TestingDate))}
        </Text>
      );
    }
    if (columnName === "gioKiem") {
      return (
        <Text className="text-gray-700">
          {formatTime(item.ngayKiem, false)}
        </Text>
      );
    }
    // if (columnName === "Actions_Right") {
    //   return (
    //     // 💡 SỬA TẠI ĐÂY: Truyền trọn vẹn `item` vào hàm xử lý xóa
    //     <TouchableOpacity
    //       onPress={() => handleDeleteItem(item)}
    //       className="justify-center items-center"
    //     >
    //       <FontAwesomeIcon icon={faTrash} color="#ef4444" size={22} />
    //     </TouchableOpacity>
    //   );
    // }
    // Các cột mặc định
    return <Text className="text-gray-700">{item[columnName]}</Text>;
  };
  //#endregion

  // const handleDeleteItem = (item: TypeFormQCHeader) => {
  //   Alert.alert(
  //     "Xác nhận xóa",
  //     `Bạn có chắc chắn muốn xóa phiếu ${item.soPhieu} này không?`,
  //     [
  //       { text: "Hủy", style: "cancel" },
  //       {
  //         text: "Xóa bản ghi",
  //         style: "destructive",
  //         onPress: async () => {
  //           setLoadingAtom(true);
  //           try {
  //             // Tạo chuỗi endpoint động theo tham số của item
  //             const url = `/qc/delete/${item.idTaiLieuKn}/${item.soPhieu}`;
  //             const response = await deleteApi(url);

  //             if (response && response.status) {
  //               Toast.show({
  //                 type: "success",
  //                 text1: "Thành công",
  //                 text2: "Đã xóa phiếu kiểm tra thành công!",
  //               });
  //               // Gọi lại danh sách để đồng bộ dữ liệu mới nhất
  //               getList();
  //             } else {
  //               Toast.show({
  //                 type: "error",
  //                 text1: "Thất bại",
  //                 text2: response?.message || "Xóa phiếu thất bại",
  //               });
  //             }
  //           } catch (error: any) {
  //             // console.error("❌ Lỗi xảy ra khi xóa phiếu:", error);
  //             Toast.show({
  //               type: "error",
  //               text1: "Thất bại",
  //               text2: "Có lỗi xảy ra, vui lòng thử lại!",
  //             });
  //           } finally {
  //             setLoadingAtom(false);
  //           }
  //         },
  //       },
  //     ],
  //   );
  // };

  const getList = async () => {
    setLoadingAtom(true);
    try {
      const url = "/APIMobile/ShiftTestingsPaging";
      const response = await getApi(url, { page: page, pageSize: 15 });

      // console.log("Dữ liệu Server trả về:", response);
      if (response.success && response.data) {
        const _data = response.data.Item;
        // const sortedData = [...response.data].sort((a, b) => {
        //   const soPhieuA = a.soPhieu || "";
        //   const soPhieuB = b.soPhieu || "";
        //   return soPhieuA.localeCompare(soPhieuB, undefined, {
        //     numeric: true,
        //     sensitivity: "base",
        //   });
        // });
        // setList(sortedData);
        const items = _data.Data || [];

        setList(items);
        setTotalPage(_data.TotalPages || 0);
      }
    } catch (error: any) {
      console.error("❌ Lỗi xảy ra tại hàm getList ở Page:", error);
      setList([]);
      setTotalPage(0);
    } finally {
      setLoadingAtom(false);
    }
  };

  useEffect(() => {
    getList();
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      getList();
      return () => {};
    }, [page]),
  );

  const handleEdit = (item: TypeFormQCHeader) => {
    console.log("item clicked", item);
    setQualityControlStatusTypeAtom("EDIT");
    // setQualityControlDetailAtom(item);
    setQualityControlDetailID(item.TestingNbr || "");
    navigate.navigate("DetailQualityControl" as never);
  };

  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-gray-100"
      style={{ paddingBottom: insets.bottom }}
    >
      <HeaderComponent
        backButton={true}
        handleBack={() => navigate.goBack()}
        title="QA/QC List"
        iconRight={
          <View className="flex-row items-center space-x-1">
            <TouchableOpacity
              onPress={getList}
              className="p-2 active:opacity-60"
            >
              <FontAwesomeIcon
                icon={faArrowsRotate}
                size={20}
                color={AppColors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setQualityControlStatusTypeAtom("NEW");
                setQualityControlDetailAtom({} as TypeFormQCHeader);
                navigate.navigate("DetailQualityControl" as never);
              }}
              className="p-2"
            >
              <FontAwesomeIcon
                icon={faPlus}
                size={22}
                color={AppColors.primary}
              />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Table Area */}

      {/* <ScrollView>
                        <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                                        {JSON.stringify(list, null, 2)}
                                    </Text>
            </ScrollView> */}
      <View className="flex-1">
        <GeneralTable
          data={list}
          columns={columns}
          selectedColumns={selectedColumns}
          onRowPress={(item) => handleEdit(item)}
          renderCell={renderCustomCell}
        />
      </View>

      {/* Sử dụng Component Pagination mới */}
      <Pagination
        page={page}
        totalPage={totalPage}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </View>
  );
};

export default QualityControlList;
