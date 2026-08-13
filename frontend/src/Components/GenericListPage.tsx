import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSetRecoilState} from 'recoil';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowsRotate,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import HeaderComponent from '../Base/HeaderComponent/headerComponent'; // Chỉnh lại đường dẫn của bạn
import GeneralTable, {TableColumn} from '../Components/GeneralTable';
import Pagination from '../Components/Pagination';
import {loadingStore} from '../Store/loadingStore';
import {getApi, deleteApi} from '../Base/api/api_service';
import {AppColors} from '../../colors';

interface GenericListPageProps<T> {
  title: string;
  fetchUrl: string;
  params: {};
  deleteUrlPattern: (item: T) => string;
  deleteConfirmMessage: (item: T) => string;
  sortKey: keyof T;

  // Cấu hình bảng
  columns: TableColumn[];
  selectedColumns: string[];
  renderCustomCell: (
    columnName: string,
    item: T,
    defaultRender: any,
  ) => React.ReactNode;

  // Điều hướng và Trạng thái (Recoil)
  onAddNew: () => void;
  onEdit: (item: T) => void;
}

function GenericListPage<T extends {id?: any; [key: string]: any}>({
  title,
  fetchUrl,
  params,
  deleteUrlPattern,
  deleteConfirmMessage,
  sortKey,
  columns,
  selectedColumns,
  renderCustomCell,
  onAddNew,
  onEdit,
}: GenericListPageProps<T>) {
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const navigate = useNavigation();
  const insets = useSafeAreaInsets();

  const [list, setList] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  const getList = async () => {
    setLoadingAtom(true);
    try {
      const response = await getApi(fetchUrl, params);
      if (response && response.data) {
        const sortedData = [...response.data].sort((a, b) => {
          const valA = String(a[sortKey] || '');
          const valB = String(b[sortKey] || '');
          return valA.localeCompare(valB, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        });
        setList(sortedData);
        if (response.pagination) {
          setTotalPage(response.pagination.totalPages || 0);
        }
      }
    } catch (error) {
      console.error(`❌ Lỗi API tại trang [${title}]:`, error);
      setList([]);
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleDeleteItem = (item: T) => {
    Alert.alert('Xác nhận xóa', deleteConfirmMessage(item), [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa bản ghi',
        style: 'destructive',
        onPress: async () => {
          setLoadingAtom(true);
          try {
            const url = deleteUrlPattern(item);
            const response = await deleteApi(url);
            if (response && (response.status || response.success)) {
              Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã xóa thành công!',
              });
              getList();
            } else {
              Toast.show({
                type: 'error',
                text1: 'Thất bại',
                text2: response?.message || 'Yêu cầu xóa thất bại',
              });
            }
          } catch (error) {
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
    ]);
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

  const cellRenderer = (columnName: string, item: T) => {
    if (columnName === 'Actions_Right') {
      return (
        <TouchableOpacity
          onPress={() => handleDeleteItem(item)}
          className="justify-center items-center">
          <FontAwesomeIcon icon={faTrash} color={AppColors.error} size={22} />
        </TouchableOpacity>
      );
    }
    return renderCustomCell(columnName, item, () => (
      <Text className="text-gray-700">{item[columnName]}</Text>
    ));
  };

  return (
    <View className="flex-1 bg-gray-100" style={{paddingBottom: insets.bottom}}>
      <HeaderComponent
        backButton={true}
        handleBack={() => navigate.goBack()}
        title={title}
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
            <TouchableOpacity onPress={onAddNew} className="p-2">
              <FontAwesomeIcon
                icon={faPlus}
                size={22}
                color={AppColors.primary}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <View className="flex-1">
        <GeneralTable
          data={list}
          columns={columns}
          selectedColumns={selectedColumns}
          onRowPress={onEdit}
          renderCell={cellRenderer}
        />
      </View>

      <Pagination
        page={page}
        totalPage={totalPage}
        onPageChange={newPage => setPage(newPage)}
      />
    </View>
  );
}

export default GenericListPage;
