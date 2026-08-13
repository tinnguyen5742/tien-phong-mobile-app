import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import {CustomColor, formatDate} from '../../../ults';
import {useSetRecoilState} from 'recoil';
import {loadingStore} from '../../../Store/loadingStore';
import Toast from 'react-native-toast-message';
import {deleteApi, getApi} from '../../../Base/api/api_service';
import GeneralTable, {TableColumn} from '../../../Components/GeneralTable';
import Pagination from '../../../Components/Pagination';
import {AppColors} from '../../../../colors';

// Import hoặc tạo Atom quản lý trạng thái tương ứng cho Thông số làm túi
// Giả định bạn tạo file store.ts tương tự bên kiểm kê
import {
  BagMakingDetailAtom,
  BagMakingDetailID,
  BagMakingStatusTypeAtom,
} from '../store';
import {BagMakingFormType} from './type';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const BagMakingSettingsList = () => {
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setBagMakingStatusTypeAtom = useSetRecoilState(BagMakingStatusTypeAtom);
  const setBagMakingDetailAtom = useSetRecoilState(BagMakingDetailAtom);
  const setBagMakingDetailID = useSetRecoilState(BagMakingDetailID);
  const navigate = useNavigation();

  const [list, setList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT', width: 50},
    {name: 'soPhieu', label: 'Số phiếu', width: 130},
    {name: 'tinhTrang', label: 'Tình trạng', width: 110},
    {name: 'ngay', label: 'Ngày', width: 100},
    {name: 'gio', label: 'Giờ', width: 70},
    {name: 'lsx', label: 'LSX', width: 110},
    {name: 'maVatTu', label: 'Mã BTP/TP', width: 110},
    {name: 'tenVatTu', label: 'Tên BTP/TP', width: 220},
    {name: 'tenCongDoan', label: 'Công đoạn', width: 110},
    {name: 'tenCa', label: 'Ca', width: 60},
    {name: 'Actions_Right', label: 'Xóa', width: 60},
  ];

  const [selectedColumns] = useState<string[]>([
    'STT',
    'soPhieu',
    'tinhTrang',
    'ngay',
    'gio',
    'lsx',
    'maVatTu',
    'tenVatTu',
    'tenCongDoan',
    'tenCa',
    'Actions_Right',
  ]);

  // Hàm render cell tùy biến giao diện dữ liệu lưới
  const renderCustomCell = (columnName: string, item: any) => {
    switch (columnName) {
      case 'soPhieu':
        return (
          <Text className="text-gray-700 font-bold text-md">
            {item.soPhieu}
          </Text>
        );

      case 'ngay':
        return (
          <Text className="text-gray-600 text-md text-center">
            {formatDate(new Date(item.ngay))}
          </Text>
        );

      case 'gio':
        return (
          <Text className="text-gray-600 text-md text-center">{item.gio}</Text>
        );

      case 'tinhTrang':
        if (item.tinhTrang === 'draft') {
          return (
            <Text className="font-semibold text-accent text-md text-center">
              Lưu tạm
            </Text>
          );
        }
        if (item.tinhTrang === 'complete') {
          return (
            <Text className="font-semibold text-green-500 text-md text-center">
              Hoàn thành
            </Text>
          );
        }
        return (
          <Text className="text-gray-700 text-md text-center">
            {item.tinhTrang}
          </Text>
        );

      case 'tenBTPTP':
        return (
          <Text className="text-gray-700 text-md" numberOfLines={1}>
            {item.tenBTPTP}
          </Text>
        );

      case 'Actions_Right':
        return (
          <TouchableOpacity
            onPress={() => handleDeleteItem(item)}
            className="justify-center items-center">
            <FontAwesomeIcon icon={faTrash} color={AppColors.error} size={22} />
          </TouchableOpacity>
        );

      default:
        return (
          <Text className="text-gray-700 text-md">{item[columnName]}</Text>
        );
    }
  };
  //#endregion

  const handleDeleteItem = (item: any) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa phiếu thông số làm túi ${item.soPhieu} này không?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa bản ghi',
          style: 'destructive',
          onPress: async () => {
            setLoadingAtom(true);
            try {
              const url = `/machines/info/bag/delete/${item.id}`; // Map theo đúng endpoint backend của bạn
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
      const url = '/machines/info/bag/list'; // Map theo đúng endpoint API list của thông số làm túi
      const response = await getApi(url, {pageNumber: page, pageSize: 15});

      if (response && response.data) {
        // Sắp xếp tăng dần theo mã số phiếu tương tự màn kiểm kê
        const sortedData = [...response.data].sort((a, b) => {
          const soCTA = a.soPhieu || '';
          const soCTB = b.soPhieu || '';
          return soCTA.localeCompare(soCTB, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        });

        setList(sortedData);
        setTotalPage(response.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error('❌ Lỗi xảy ra tại hàm getList Thông số làm túi:', error);
      setList([]);
      setTotalPage(1);
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

  const handleEdit = (item: any) => {
    setBagMakingStatusTypeAtom('EDIT');
    // setBagMakingDetailAtom(item);
    setBagMakingDetailID(item.id);
    navigate.navigate('BagMakingSettingsDetail' as never); // Điều hướng đến trang chi tiết thông số làm túi
  };

  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-gray-100" style={{paddingBottom: insets.bottom}}>
      <HeaderComponent
        backButton={true}
        handleBack={() => navigate.goBack()}
        title="Danh sách Thông số làm túi"
        iconRight={
          <TouchableOpacity
            onPress={() => {
              setBagMakingStatusTypeAtom('NEW');
              setBagMakingDetailAtom({} as BagMakingFormType);
              navigate.navigate('BagMakingSettingsDetail' as never);
            }}
            className="p-2">
            <FontAwesomeIcon
              icon={faPlus}
              size={22}
              color={AppColors.primary}
            />
          </TouchableOpacity>
        }
      />

      {/* Khối hiển thị bảng dữ liệu cấu hình theo hình ảnh */}
      <View className="flex-1">
        <GeneralTable
          data={list}
          columns={columns}
          selectedColumns={selectedColumns}
          onRowPress={item => handleEdit(item)}
          renderCell={renderCustomCell}
        />
      </View>

      {/* Thanh điều hướng phân trang dữ liệu */}
      <Pagination
        page={page}
        totalPage={totalPage}
        onPageChange={newPage => setPage(newPage)}
      />
    </View>
  );
};

export default BagMakingSettingsList;
