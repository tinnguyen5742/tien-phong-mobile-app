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
import {TypeFormStockTake} from './type';
import Toast from 'react-native-toast-message';
import {deleteApi, getApi} from '../../Base/api/api_service';
import {
  StockTakeDetailAtom,
  StockTakeDetailID,
  StockTakeStatusTypeAtom,
} from './store';
import GeneralTable, {TableColumn} from '../../Components/GeneralTable';
import Pagination from '../../Components/Pagination';
import {AppColors} from '../../../colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const StockTakeList = () => {
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setStockTakeStatusTypeAtom = useSetRecoilState(StockTakeStatusTypeAtom);
  const setStockTakeDetailAtom = useSetRecoilState(StockTakeDetailAtom);
  const setStockTakeDetailID = useSetRecoilState(StockTakeDetailID);
  const navigate = useNavigation();

  const [list, setList] = useState<TypeFormStockTake[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(10);

  //#region Table Config
  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT'},
    {name: 'SoKiemKe', label: 'Số phiếu', width: 120},
    {name: 'tinhTrang', label: 'Tình trạng', width: 120},
    {name: 'NgayKiemKe', label: 'Ngày kiểm kê', width: 120},
    {name: 'maKho', label: 'Mã Kho'},
    {name: 'tenKho', label: 'Tên Kho', width: 120},
    {name: 'Actions_Right', label: 'Xóa', width: 60},
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'SoKiemKe',
    'tinhTrang',
    'NgayKiemKe',
    'maKho',
    'tenKho',
    'Actions_Right',
  ]);

  // Hàm xử lý hiển thị cell đặc biệt
  const renderCustomCell = (columnName: string, item: any) => {
    if (columnName === 'SoKiemKe') {
      return <Text className="text-gray-700 font-medium">{item.soKiemKe}</Text>;
    }
    if (columnName === 'NgayKiemKe') {
      return (
        <Text className="text-gray-700">
          {formatDate(new Date(item.ngayKK))}
        </Text>
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
        <TouchableOpacity
          onPress={() => handleDeleteItem(item)}
          className="justify-center items-center">
          <FontAwesomeIcon icon={faTrash} color={AppColors.error} size={22} />
        </TouchableOpacity>
      );
    }
    // Các cột mặc định
    return <Text className="flex-1 text-gray-700">{item[columnName]}</Text>;
  };
  //#endregion

  const handleDeleteItem = (item: TypeFormStockTake) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa phiếu ${item.soKiemKe} này không?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa bản ghi',
          style: 'destructive',
          onPress: async () => {
            setLoadingAtom(true);
            try {
              const url = `/stocktaking/delete/${item.soKiemKe}`;
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
      const url = '/stocktaking/list';
      const response = await getApi(url, {pageNumber: page, pageSize: 15});

      // console.log("Dữ liệu Server trả về:", response);
      if (response && response.data) {
        const sortedData = [...response.data].sort((a, b) => {
          const soCTA = a.soKiemKe || '';
          const soCTB = b.soKiemKe || '';
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

  const handleEdit = (item: TypeFormStockTake) => {
    setStockTakeStatusTypeAtom('EDIT');
    // setStockTakeDetailAtom(item);
    setStockTakeDetailID(item.soKiemKe || '');
    navigate.navigate('StockTakeDetail' as never);
  };

  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-gray-100" style={{paddingBottom: insets.bottom}}>
      <HeaderComponent
        backButton={true}
        handleBack={() => navigate.goBack()}
        title="Danh sách Kiểm kê"
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
                setStockTakeStatusTypeAtom('NEW');
                setStockTakeDetailAtom({
                  tinhTrang: '',
                  soKiemKe: '',
                  ngayKK: new Date(),
                  maKho: '',
                  tenKho: '',
                  lines: [],
                });
                navigate.navigate('StockTakeDetail' as never);
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
      {/* <View className="flex-1 px-2 mt-2">
                {generalTable(list)}
            </View> */}

      {/* Table Area */}
      <View className="flex-1">
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

export default StockTakeList;
