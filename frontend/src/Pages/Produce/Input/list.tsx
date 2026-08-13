import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Bỏ import ListProduceStyles
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {
  faArrowsRotate,
  faGear,
  faLeftLong,
  faPlus,
  faRightLong,
  faRotateRight,
  faSearch,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import {CustomColor, formatDate} from '../../../ults';
import {AppColors} from '../../../../colors';
import {ProduceAtomType, ProduceDetailAtom, ProduceDetailID} from '../store';
import {useSetRecoilState} from 'recoil';
import {useCallback, useEffect, useState} from 'react';
import {DepartmentModalValue, TypeFormProduce} from '../type';
import {loadingStore} from '../../../Store/loadingStore';
import {deleteApi, getApi, postApi} from '../../../Base/api/api_service';
import Toast from 'react-native-toast-message';
import SettingModal from '../Modal/SettingModal';
import DepartmentModal from '../Modal/DepartmentModal';
import SearchModal from '../Modal/SearchModal';
import GeneralTable, {TableColumn} from '../../../Components/GeneralTable';
import Pagination from '../../../Components/Pagination';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
const InputProduceNavigate = () => {
  const setProduceTypeAtom = useSetRecoilState(ProduceAtomType);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setProduceDetailAtom = useSetRecoilState(ProduceDetailAtom);
  const setProduceDetailID = useSetRecoilState(ProduceDetailID);
  const [list, setList] = useState([] as TypeFormProduce[]);
  // const [departmentModal, setDepartmentModal] = useState(true);
  // const [departmentValue, setDepartmentValue] = useState<DepartmentModalValue>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(0);
  const [settingModal, setSettingModal] = useState(false);
  const [openSeachModal, setOpenSearchModal] = useState(false);

  const navigate = useNavigation();

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'soCT',
    'tinhTrang',
    'ngay',
    'ghiChu',
    'lsx',
    'maVatTu',
    'tenVatTu',
    'congDoanDen',
    'tenCaSX',
    'Actions_Right',
  ]);
  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT'},
    {name: 'soCT', label: 'Số phiếu', width: 150},
    {name: 'tinhTrang', label: 'Tình trạng'},
    {name: 'ngay', label: 'Ngày CCĐ'},
    {name: 'ghiChu', label: 'Ghi chú', width: 220},
    {name: 'lsx', label: 'LSX', width: 120},
    {name: 'maVatTu', label: 'Mã TP/BTP'},
    {name: 'tenVatTu', label: 'Tên TP/BTP', width: 220},
    // { name: "congDoanTu", label: "Từ CĐ" },
    {name: 'congDoanDen', label: 'Công đoạn', width: 130},
    {name: 'tenCaSX', label: 'Ca'},
    // { name: "soLuongMacDinh", label: "SL MD" },
    {name: 'Actions_Right', label: 'Xóa', width: 80},
  ];

  // Hàm xử lý hiển thị cell đặc biệt
  const renderCustomCell = (columnName: string, item: any) => {
    if (columnName === 'ngay') {
      return (
        <Text className="text-gray-700">{formatDate(new Date(item.ngay))}</Text>
      );
    }
    if (columnName === 'soCT') {
      return <Text className="text-gray-700 font-medium">{item.soCT}</Text>;
    }
    if (columnName === 'ghiChu') {
      return (
        <View style={{width: 220}} className="items-start justify-center px-2">
          <Text className="text-left text-gray-700">{item.ghiChu}</Text>
        </View>
      );
    }
    if (columnName === 'congDoanTu') {
      return (
        <Text className="text-gray-700 font-medium">
          {item.headerIn.tenCongDoanTu}
        </Text>
      );
    }
    if (columnName === 'congDoanDen') {
      return (
        <Text className="text-gray-700 font-medium">
          {item.headerIn.tenCongDoanDen}
        </Text>
      );
    }
    if (columnName === 'tenVatTu') {
      return (
        <View style={{width: 220}} className="items-start justify-center px-2">
          <Text className="text-left text-gray-700">{item.tenVatTu}</Text>
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
    if (columnName === 'soLuongMacDinh') {
      const rawValue = item.soLuongMacDinh;

      // Kiểm tra nếu dữ liệu hợp lệ thì ép hiển thị 4 số thập phân, ngược lại hiển thị "0.0000"
      const formattedValue =
        rawValue !== null && rawValue !== undefined && !isNaN(Number(rawValue))
          ? Number(rawValue).toFixed(4)
          : '0.0000';

      return (
        <Text className="text-gray-700 text-center font-medium">
          {formattedValue}
        </Text>
      );
    }
    if (columnName === 'Actions_Right') {
      return (
        // 💡 SỬA TẠI ĐÂY: Truyền trọn vẹn `item` vào hàm xử lý xóa
        <TouchableOpacity
          onPress={() => handleDeleteItem(item)}
          className="justify-center items-center">
          <FontAwesomeIcon icon={faTrash} color="#ef4444" size={16} />
        </TouchableOpacity>
      );
    }
    // Các cột mặc định
    return <Text className="text-gray-700">{item[columnName]}</Text>;
  };

  const handleDeleteItem = (item: TypeFormProduce) => {
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
              // Tạo chuỗi endpoint động theo tham số của item
              const url = `/mfg/production/delete/${item.id}`;
              const response = await deleteApi(url);

              if (response && response.status) {
                Toast.show({
                  type: 'success',
                  text1: 'Thành công',
                  text2: 'Đã xóa phiếu thành công!',
                });
                // Gọi lại danh sách để đồng bộ dữ liệu mới nhất
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
      const url = '/mfg/production/list';
      const query = {pageNumber: page, pageSize: 15, loaiPhieu: 'IN'};
      const response = await getApi(url, query);

      if (response && response.data) {
        // Đã sửa lỗi: Map đúng trường soCT từ API trả về để tiến hành sắp xếp chuỗi
        const sortedData = [...response.data].sort((a, b) => {
          const soPhieuA = a.soCT || '';
          const soPhieuB = b.soCT || '';
          return soPhieuA.localeCompare(soPhieuB, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
        });

        setList(sortedData);
        if (response.pagination) {
          setTotalPage(response.pagination.totalPages || 0);
        }
      }
    } catch (error: any) {
      console.error('❌ Lỗi xảy ra tại hàm getList ở Page:', error);
      setList([]);
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

  const handleEdit = (item: TypeFormProduce) => {
    console.log('item clicked', item);
    setProduceTypeAtom('EDIT');
    // setProduceDetailAtom(item);
    setProduceDetailID(item.id || 0);
    navigate.navigate('InputDetailProduce' as never);
  };

  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-gray-100" style={{paddingBottom: insets.bottom}}>
      <HeaderComponent
        backButton={true}
        handleBack={() => navigate.goBack()}
        title="Danh sách sản xuất đầu vào"
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
                setProduceTypeAtom('NEW');
                setProduceDetailAtom({
                  ngay: new Date(),
                } as TypeFormProduce);
                navigate.navigate('InputDetailProduce' as never);
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
      {/* <ScrollView>
                <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                    {JSON.stringify(list, null, 2)}
                </Text>
            </ScrollView> */}

      {/* Toolbar Action */}
      {/* <View className="flex-row justify-end p-2 space-x-2">
                <Pressable onPress={() => setSettingModal(true)} className="flex-row items-center bg-cyan-700 p-4 rounded-lg shadow-sm">
                    <Text className="text-white mr-2 text-md">Tùy chỉnh</Text>
                    <FontAwesomeIcon icon={faGear} size={14} color="white" />
                </Pressable>

                <Pressable onPress={() => setDepartmentModal(true)} className="bg-cyan-700 p-4 rounded-lg shadow-sm">
                    <Text className="text-white text-md">Chọn bộ phận</Text>
                </Pressable>

                <Pressable onPress={() => setOpenSearchModal(true)} className="bg-cyan-700 p-4 rounded-lg shadow-sm">
                    <FontAwesomeIcon icon={faSearch} size={18} color="white" />
                </Pressable>

                <Pressable
                    onPress={() => getList(page, pageSize, departmentValue?.maBoPhan || '')} // Gọi hàm không truyền tham số
                    className="bg-cyan-700 p-4 rounded-lg shadow-sm"
                >
                    <FontAwesomeIcon icon={faRotateRight} size={18} color="white" />
                </Pressable>
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

      <Pagination
        page={page}
        totalPage={totalPage}
        onPageChange={newPage => setPage(newPage)}
      />

      {/* Modals */}
      {settingModal && (
        <SettingModal
          handleOpenSettingModal={() => setSettingModal(false)}
          onSubmit={() => {}}
          open={settingModal}
          title="Cài đặt hiển thị"
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          columns={columns}
        />
      )}
      {/* {departmentModal && (
                <DepartmentModal
                    handleOpenDepartmentModal={() => setDepartmentModal(false)}
                    onSubmit={(item) => { setDepartmentValue(item); setDepartmentModal(false); }}
                    open={departmentModal}
                    title="Bộ phận"
                />
            )} */}
      {/* {openSeachModal && (
                <SearchModal
                    handleOpenSeachModal={() => setOpenSearchModal(false)}
                    open={openSeachModal}
                    title="Tìm kiếm"
                    onSubmit={(search) => { getList(search.LSX); setOpenSearchModal(false); }}
                />
            )} */}
    </View>
  );
};

export default InputProduceNavigate;
