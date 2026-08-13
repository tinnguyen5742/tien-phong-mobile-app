import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowsRotate,
  faLeftLong,
  faPlus,
  faRightLong,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {CustomColor, formatDate} from '../../ults';
import {useSetRecoilState} from 'recoil';
import {loadingStore} from '../../Store/loadingStore';
import {TypeFormWarehouse} from './type';
import {deleteApi, getApi} from '../../Base/api/api_service';
import {
  WarehouseStatusTypeAtom,
  WarehouseDetailAtom,
  WarehouseDetailID,
} from './store';
import GeneralTable, {TableColumn} from '../../Components/GeneralTable';
import Pagination from '../../Components/Pagination';
import {AppColors} from '../../../colors';
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import Toast from "react-native-toast-message";

const Warehouse = () => {
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setWarehouseStatusTypeAtom = useSetRecoilState(WarehouseStatusTypeAtom);
  const setWarehouseDetailAtom = useSetRecoilState(WarehouseDetailAtom);
  const setWarehouseDetailID = useSetRecoilState(WarehouseDetailID);
  const navigate = useNavigation();

  const [list, setList] = useState<TypeFormWarehouse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const defaultWarehouseValue = {
    soCT: '',
    ngay: new Date().toISOString(),
    soDeNghi: '',
    maKhoXuat: '',
    khoXuat: '',
    viTriXuat: '',
    maKhoNhap: '',
    khoNhap: '',
    viTriNhap: '',
    User: '',
    TinhTrang: '',
    lines: [],
  };

  //#region Table Config
  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT'},
    {name: 'soCT', label: 'Số chứng từ', width: 150},
    {name: 'ngay', label: 'Ngày chứng từ', width: 120},
    {name: 'ghiChu', label: 'Ghi chú', width: 220},
    {name: 'khoXuat', label: 'Kho xuất', width: 180},
    {name: 'viTriXuat', label: 'Vị trí xuất', width: 120},
    {name: 'khoNhap', label: 'Kho nhập', width: 180},
    {name: 'viTriNhap', label: 'Vị trí nhập', width: 120},
    {name: 'createdUser', label: 'Username', width: 120},
    {name: 'tinhTrang', label: 'Tình trạng', width: 120},
    {name: 'Actions_Right', label: 'Xóa', width: 80},
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'soCT',
    'ngay',
    'ghiChu',
    'khoXuat',
    'viTriXuat',
    'khoNhap',
    'viTriNhap',
    'createdUser',
    'tinhTrang',
    'Actions_Right',
  ]);

  // Hàm xử lý hiển thị cell đặc biệt
  const renderCustomCell = (columnName: string, item: any) => {
    if (columnName === 'soCT') {
      return <Text className="text-gray-700 font-medium">{item.soCT}</Text>;
    }
    if (columnName === 'ngay') {
      return (
        <Text className="text-gray-700">{formatDate(new Date(item.ngay))}</Text>
      );
    }
    if (columnName === 'ghiChu') {
      return (
        <View style={{width: 220}} className="items-start justify-center px-2">
          <Text className="text-left text-gray-700">{item.ghiChu}</Text>
        </View>
      );
    }
    if (columnName === 'tinhTrang') {
      if (item.tinhTrang === 'draft') {
        return <Text className="font-semibold text-accent">Lưu tạm</Text>;
      }
      if (item.tinhTrang === 'complete') {
        return <Text className="font-semibold text-green-500">Hoàn thành</Text>;
      }
      return <Text className="text-gray-700">{item.tinhTrang}</Text>;
    }
    if (columnName === 'Actions_Right') {
      return (
        // 💡 SỬA TẠI ĐÂY: Truyền trọn vẹn `item` vào hàm xử lý xóa
        <TouchableOpacity
          onPress={() => handleDeleteItem(item)}
          className="justify-center items-center">
          <FontAwesomeIcon icon={faTrash} color={AppColors.error} size={16} />
        </TouchableOpacity>
      );
    }
    // Các cột mặc định
    return <Text className="text-gray-700">{item[columnName]}</Text>;
  };
  //#endregion

  const handleDeleteItem = (item: TypeFormWarehouse) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa phiếu ${item.soCT} này không?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa bản ghi',
          style: 'destructive',
          onPress: async () => {
            setLoadingAtom(true);
            try {
              const url = `/inventory/warehouse/transfer/delete/${item.id}`;
              const response = await deleteApi(url);
              if (response && (response.success || response.status)) {
                Toast.show({
                  type: 'success',
                  text1: 'Thành công',
                  text2: response?.message || 'Xóa phiếu thành công!',
                });
                getList();
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Thất bại',
                  text2: response?.message || 'Xóa phiếu thất bại',
                });
              }
            } catch (error: any) {
              // console.error("❌ Lỗi xảy ra khi xóa phiếu:", error);
              Toast.show({
                type: 'error',
                text1: 'Thất bại',
                text2: 'Có lỗi xảy ra, vui lòng thử lại!',
              });
            } finally {
              setLoadingAtom(false);
            }
          },
        },
      ],
    );
  };

  const getList = async () => {
    setLoadingAtom(true);
    try {
      const url = '/inventory/warehouse/transfer/list';
      const response = await getApi(url, {
        pageNumber: page,
        pageSize: 15,
        transferType: 'XUAT_CHUYEN_KHO',
      });

      // console.log("Dữ liệu Server trả về:", response);
      if (response && response.data) {
        const sortedData = [...response.data].sort((a, b) => {
          const soCTA = a.soCT || '';
          const soCTB = b.soCT || '';
          return soCTA.localeCompare(soCTB, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        });

        setList(sortedData);
        setTotalPage(response.pagination.totalPages || 0);
      }
    } catch (error: any) {
      console.error('❌ Lỗi xảy ra tại hàm getList ở Page:', error);
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

  const handleEdit = (item: TypeFormWarehouse) => {
    setWarehouseStatusTypeAtom('EDIT');
    // setWarehouseDetailAtom(item);
    setWarehouseDetailID(item.id || 0);
    navigate.navigate('WarehouseDetail' as never);
  };

  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-gray-100" style={{paddingBottom: insets.bottom}}>
      <HeaderComponent
        backButton={true}
        handleBack={() => navigate.goBack()}
        title="Chứng từ nhập/xuất kho"
        iconRight={
          <View className="flex-row items-center space-x-1">
            <TouchableOpacity
              onPress={getList}
              className="p-2 active:opacity-60">
              <FontAwesomeIcon
                icon={faArrowsRotate}
                size={20}
                color={AppColors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setWarehouseStatusTypeAtom('NEW');
                setWarehouseDetailAtom(defaultWarehouseValue);
                navigate.navigate('WarehouseDetail' as never);
              }}
              className="p-2">
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
      <View className="flex-1">
        {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                    {JSON.stringify(list, null, 2)}
                </Text> */}
        <GeneralTable
          data={list}
          columns={columns}
          selectedColumns={selectedColumns}
          onRowPress={item => handleEdit(item)}
          renderCell={renderCustomCell}
        />
      </View>

      {/* Sử dụng Component Pagination mới */}
      <Pagination
        page={page}
        totalPage={totalPage}
        onPageChange={newPage => setPage(newPage)}
      />
    </View>
  );
};

export default Warehouse;
