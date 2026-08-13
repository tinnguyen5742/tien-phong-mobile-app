import {
  faAdd,
  faTrash,
  faSave,
  faXmark,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {useNavigation} from '@react-navigation/native';
import {loadingStore} from '../../Store/loadingStore';
import {CustomColor, formatDate} from '../../ults';
import {AppColors} from '../../../colors';
import {LineFormStockTake, TypeFormStockTake} from './type';
import {getApi, postApi, putApi} from '../../Base/api/api_service';
import {
  StockTakeDetailAtom,
  StockTakeDetailID,
  StockTakeStatusTypeAtom,
} from './store';
import CameraScannerWrapper from '../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {LocatorType, WarehouseType} from '../WareHouse/type';
import {getSettingValue} from '../Login/store/asyncUserStorage';
import {settingStore} from '../../Store/settingStore';
import WarehouseModal from '../WareHouse/Modal/WarehouseModal';
import LocatorModal from '../WareHouse/Modal/LocatorModal';
import StockTakeLineModal from './Modal/StockTakeLineModal';
import GeneralTable, {TableColumn} from '../../Components/GeneralTable';
import DatePicker from 'react-native-date-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const StockTakeDetail = () => {
  const navigate = useNavigation();
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const statusTypeValue = useRecoilValue(StockTakeStatusTypeAtom);
  const detailStockTakeValue = useRecoilValue(StockTakeDetailAtom);
  const stockTakeDetailID = useRecoilValue(StockTakeDetailID);
  const [settings, setSettings] = useRecoilState(settingStore);

  // State
  const [formValues, setFormValues] = useState<TypeFormStockTake>({
    tinhTrang: 'draft',
    soKiemKe: '',
    ngayKK: new Date(),
    maKho: '',
    tenKho: '',
    lines: [] as LineFormStockTake[],
  });
  const [cameraField, setCameraField] = useState<string>('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [currentLineEdit, setCurrentLineEdit] = useState<number | null>(null);
  const [currentLineForm, setCurrentLineForm] = useState<LineFormStockTake>({
    maLocator: '',
    maVatTu: '',
    tenVatTu: '',
    dvtGoc: '',
    soLo: '',
    soLuongKK: 0,
  });
  const [warehouseList, setWarehouseList] = useState<WarehouseType[]>([]);
  const [locatorList, setLocatorList] = useState<LocatorType[]>([]);
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseType | null>(null);
  const [locatorModal, setLocatorModal] = useState(false);
  const [selectedLocator, setSelectedLocator] = useState<LocatorType | null>(
    null,
  );
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [qrScanField, setQrScanField] = useState<string>('');
  const [loVatTuList, setLoVatTuList] = useState<any[]>([]);
  const [loVatTuModalOpen, setLoVatTuModalOpen] = useState(false);
  const [statusModalLine, setStatusModalLine] = useState('NEW');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [openDate, setOpenDate] = useState(false);
  const [dateStockTake, setDateStockTake] = useState(new Date());
  const [lineIndexItem, setLineIndexItem] = useState<number>(-1);
  const [pendingLineFromQr, setPendingLineFromQr] =
    useState<LineFormStockTake | null>(null);

  useEffect(() => {
    handleGetListWarehouse();
    // handleGetListLocator();
    loadSettings();
  }, []);

  const handleGetStockTakeDetail = async (id: string) => {
    try {
      const url = `/stocktaking/list/one?soKiemKe=${id}`;
      console.log('url handleGetStockTakeDetail: ', url);
      const item = await getApi(url, {});
      console.log('handleGetStockTakeDetail: ', item);
      if (item?.status === true && item?.data) {
        setFormValues(item.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Đã có lỗi xảy ra!',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    if (statusTypeValue === 'EDIT' && stockTakeDetailID) {
      handleGetStockTakeDetail(stockTakeDetailID);
      setFormValues(prev => ({
        ...prev,
        ngayKK:
          formValues.ngayKK instanceof Date
            ? formValues.ngayKK
            : new Date(formValues.ngayKK),
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        ngayKK: new Date(),
      }));
    }
  }, [statusTypeValue, stockTakeDetailID]);

  useEffect(() => {
    if (
      statusTypeValue === 'EDIT' &&
      formValues.maKho &&
      warehouseList.length > 0
    ) {
      const filteredWarehouse = warehouseList.find(
        (warehouse: WarehouseType) => warehouse.maKho === formValues.maKho,
      );
      if (filteredWarehouse) {
        setSelectedWarehouse(filteredWarehouse);
      }
    }
  }, [formValues.maKho, statusTypeValue, warehouseList]);

  //#region - Danh sách các cột muốn hiển thị mặc định
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'maVatTu',
    'tenVatTu',
    'soLo',
    'dvtGoc',
    'soLuongKK',
    'Actions_Right',
  ]);

  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT'},
    {name: 'maVatTu', label: 'Mã vật tư'},
    {name: 'tenVatTu', label: 'Tên vật tư', width: 220},
    {name: 'dvtGoc', label: 'ĐVT gốc'},
    {name: 'soLo', label: 'Số lô', width: 140},
    {name: 'soLuongKK', label: 'SL KK'},
    {name: 'Actions_Right', label: 'Xóa', width: 50},
  ];

  // Hàm xử lý hiển thị cell đặc biệt
  const renderCustomCell = (columnName: string, item: any, index: number) => {
    if (columnName === 'soLo') {
      return (
        <View key="STT" className="items-center justify-center">
          <Text className="text-gray-700">{item.soLo}</Text>
        </View>
      );
    }
    if (columnName === 'tenVatTu') {
      return (
        <View style={{width: 220}} className="items-start justify-center px-2">
          <Text className="text-left text-gray-700 font-medium">
            {item.tenVatTu}
          </Text>
        </View>
      );
    }
    if (columnName === 'Actions_Right') {
      return (
        <TouchableOpacity onPress={() => handleDeleteItem(index)}>
          <FontAwesomeIcon icon={faTrash} color={AppColors.error} size={22} />
        </TouchableOpacity>
      );
    }
    // Các cột mặc định
    return <Text className="text-gray-700">{item[columnName]}</Text>;
  };
  //#endregion

  const loadSettings = async () => {
    try {
      const value = await getSettingValue();
      setSettings({useCameraScan: value});
    } catch (error) {
      console.error('Error loading setting:', error);
    }
  };

  const handleEdit = (item: LineFormStockTake, index: number) => {
    setCurrentLineForm(item);
    setStatusModalLine('EDIT');
    setEditIndex(index); // Lưu lại vị trí dòng để tí nữa lưu đè
    setLineModalOpen(true);
  };

  const handleSubmitLine = (lineData: LineFormStockTake) => {
    // cons ole.log(">>> [Detail] editIndex hiện tại:", editIndex);
    // console.log(">>> [Detail] Dữ liệu nhận từ Modal:", lineData);

    // Thay đổi điều kiện: Kiểm tra biến editIndex thay vì currentLineEdit
    if (editIndex !== null && editIndex >= 0) {
      // --- TRƯỜNG HỢP CHỈNH SỬA (LƯU ĐÈ) ---
      setFormValues(prev => {
        // Tạo mảng mới từ prev.lines để phá vỡ tham chiếu bộ nhớ (giúp Table render lại)
        const updatedLines = [...prev.lines];

        // Ghi đè dữ liệu mới từ Modal vào đúng vị trí dòng đang sửa
        updatedLines[editIndex] = {
          ...updatedLines[editIndex], // Giữ lại các trường ẩn nếu có
          ...lineData, // Ghi đè thông tin mới
          soLuongKK: parseFloat(lineData.soLuongKK.toString()) || 0, // Đảm bảo kiểu số số thực
        };

        return {
          ...prev,
          lines: updatedLines,
        };
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật dòng thành công',
      });
    } else {
      // --- TRƯỜNG HỢP THÊM MỚI ---
      setFormValues(prev => ({
        ...prev,
        lines: [
          ...prev.lines,
          {
            ...lineData,
            soLuongKK: parseFloat(lineData.soLuongKK.toString()) || 0,
          },
        ],
      }));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Thêm dòng thành công',
      });
    }

    // --- DỌN DẸP TRẠNG THÁI SAU KHI ĐÓNG MODAL ---
    setStatusModalLine('NEW');
    setLineModalOpen(false);
    setPendingLineFromQr(null);
    setEditIndex(null); // Reset biến chỉ số sửa về null để tránh lỗi cache cho lần sau
  };

  const handleDeleteItem = (index: number) => {
    console.log('key delete: ', index);
    // Xóa dòng tại chỉ mục `index` khỏi `formValues.lines`
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      lines: prevFormValues.lines.filter((_, i) => i !== index),
    }));
  };

  const handleBack = () => {
    // setLineIndexItem(-1);
    navigate.goBack();
  };

  const handleSave = async (status: string) => {
    if (!formValues.maKho || formValues.lines.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mã kho và ít nhất 1 dòng kiểm kê',
      });
      return;
    }

    setLoadingAtom(true);
    try {
      const submitData = {
        tinhTrang: status,
        soKiemKe: formValues.soKiemKe,
        ngayKK: formValues.ngayKK,
        maKho: formValues.maKho,
        tenKho: formValues.tenKho,
        maLocator: formValues.maLocator,
        lines: formValues.lines.map(line => ({
          maLocator: line.maLocator,
          maVatTu: line.maVatTu,
          tenVatTu: line.tenVatTu,
          DVTGoc: line.dvtGoc,
          soLo: line.soLo,
          soLuongKK: line.soLuongKK,
        })),
      };
      // console.log("submitData kiemke: ", submitData);
      const url =
        statusTypeValue === 'EDIT'
          ? `/stocktaking/update/${formValues.soKiemKe}`
          : `/stocktaking/create`;
      console.log('URL KIEM KE: ', url);
      console.log('submitData KK: ', submitData);
      // return
      // const resp = await postApi(url, submitData);
      if (statusTypeValue === 'EDIT') {
        const resp = await putApi(url, submitData);
        console.log('🔴 Kiểm tra phản hồi API thành công - Resp:', resp);

        // Kiểm tra điều kiện thành công (tùy thuộc cấu trúc JSON của Backend trả về)
        if (resp && (resp.success || resp.status || resp.data)) {
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Lưu dữ liệu thành công',
          });
          navigate.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: resp?.message || 'Lưu thất bại',
          });
        }
      } else {
        const resp = await postApi(url, submitData);
        console.log('🔴 Kiểm tra phản hồi API thành công - Resp:', resp);

        // Kiểm tra điều kiện thành công (tùy thuộc cấu trúc JSON của Backend trả về)
        if (resp && (resp.success || resp.status || resp.data)) {
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Lưu dữ liệu thành công',
          });
          navigate.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: resp?.message || 'Lưu thất bại',
          });
        }
      }
    } catch (err: any) {
      // Khối catch này sẽ bắt được lỗi từ lệnh "throw error" trong postApi của bạn
      console.log('🔴 Kiểm tra phản hồi lỗi API - Err: ', err);
      if (err.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Tình trạng phiếu đã đóng, không thể lưu!',
        });
        handleBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Đã có lỗi xảy ra vui lòng thử lại!',
          text2:
            err?.message || typeof err === 'string'
              ? err
              : 'Mã phản hồi không hợp lệ hoặc trùng lặp kho',
        });
      }
    } finally {
      setLoadingAtom(false); // Đảm bảo luôn luôn tắt loading dù thành công hay thất bại
    }
  };

  const handleGetListWarehouse = async () => {
    setLoadingAtom(true);
    try {
      const url = `/inventory/warehouse/list`;
      const item = await getApi(url, {});
      if (item && item.data) {
        // console.log("List kho: ", item.data)
        const sortedWarehouses = [...item.data];
        sortedWarehouses.sort((a, b) =>
          (a.maKho || '').localeCompare(b.maKho || '', undefined, {
            numeric: true,
          }),
        );
        setWarehouseList(sortedWarehouses);
      }
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleGetListLocator = async (maKho: string) => {
    if (!maKho) return;
    setLoadingAtom(true);
    try {
      const url = `/inventory/warehouse/location/list`;
      const item = await getApi(url, {});
      if (item && item.data) {
        let list =
          item.data.filter((f: any) => f.maKho && f.maKho === maKho) ?? [];
        list.sort((a: any, b: any) =>
          (a.maLocator || '').localeCompare(b.maLocator || '', undefined, {
            numeric: true,
          }),
        );
        // console.log("Danh sách vị trí theo mã Kho: ", list)
        setLocatorList(list);
      }
    } catch (error) {
      console.error(`Lỗi lấy vị trí: `, error);
    } finally {
      setLoadingAtom(false);
    }
  };

  useEffect(() => {
    if (formValues?.maKho) {
      // console.log("Mã kho: ", formValues?.maKho)
      handleGetListLocator(formValues.maKho);
    }
  }, [formValues.maKho]);

  const handleScanResult = (qrData: string) => {
    if (cameraField === 'locator') {
      const locator = locatorList.find(l => l.maLocator === qrData);
      if (locator) {
        setSelectedLocator(locator);
        setFormValues(prev => ({...prev, maLocator: locator.maLocator}));
      }
    } else if (qrScanField === 'product') {
      const parts = qrData.split('#');
      if (parts.length === 2)
        handleSearchLoVatTu(parts[0].trim(), parts[1].trim());
    }
    setShowCameraModal(false);
  };

  const handleSearchLoVatTu = async (maVatTu: string, soLo: string) => {
    setLoadingAtom(true);
    // post_cus('/lovattu/search', { maVatTu, soLo }, (err: any, resp: any) => {
    //     setLoadingAtom(false);
    //     if (!err && resp.success && resp.data.length > 0) {
    //         if (resp.data.length === 1) {
    //             addLoVatTuToLine(resp.data[0]);
    //         } else {
    //             setLoVatTuList(resp.data);
    //             setLoVatTuModalOpen(true);
    //         }
    //     } else {
    //         Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tìm thấy vật tư' });
    //     }
    // });
  };

  const addLoVatTuToLine = (item: any) => {
    if (!formValues.maLocator) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn locator trước',
      });
      return;
    }
    const newLine = {
      maLocator: item.maLocator,
      maVatTu: item.maVatTu,
      tenVatTu: item.tenVatTu,
      dvtGoc: item.dvtGoc,
      soLo: item.soLo,
      soLuongKK: 0,
    };
    setPendingLineFromQr(newLine);
    setCurrentLineForm(newLine);
    setCurrentLineEdit(null);
    setLineModalOpen(true);
  };

  const insets = useSafeAreaInsets();
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <View className="flex-1 bg-white" style={{paddingBottom: insets.bottom}}>
        <HeaderComponent
          backButton={true}
          handleBack={() => navigate.goBack()}
          iconRight={
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => handleSave('draft')}>
                <Text className="font-semibold text-accent pr-5">Lưu tạm</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSave('complete')}>
                <FontAwesomeIcon
                  icon={faSave}
                  size={25}
                  color={AppColors.primary}
                />
              </TouchableOpacity>
            </View>
          }
          title={
            statusTypeValue === 'EDIT'
              ? 'Cập Nhật Kiểm Kê'
              : 'Tạo Phiếu Kiểm Kê'
          }
        />

        <View className="flex-1 p-3">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Section: Header Info (Đồng nhất với DetailProduce) */}
            <View className="bg-gray-50 rounded-xl px-2 mb-4 shadow-sm border border-gray-100">
              {/* <Text style={{fontFamily: 'monospace'}} className="text-gray-900">
                {JSON.stringify(formValues, null, 2)}
              </Text> */}
              {statusTypeValue === 'EDIT' && (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium">Số phiếu:</Text>
                  <Text className="text-gray-900 font-bold">
                    {formValues.soKiemKe}
                  </Text>
                </View>
              )}

              {/* <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                                <Text className="text-gray-600 font-medium">Ngày kiểm kê</Text>
                                <Text className="text-gray-900">{formValues.ngayKK.toLocaleDateString()}</Text>
                            </View> */}
              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Ngày kiểm kê:
                </Text>
                <Pressable
                  onPress={() => setOpenDate(true)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                  <Text className="text-slate-800 text-right font-bold">
                    {formValues?.ngayKK
                      ? formatDate(new Date(formValues.ngayKK))
                      : formatDate(new Date())}
                  </Text>
                </Pressable>
              </View>

              {/* Kho */}
              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">Kho:</Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                  onPress={() => setWarehouseModal(true)}>
                  <Text
                    className={
                      formValues.maKho ? 'text-gray-900' : 'text-gray-400'
                    }>
                    {formValues.maKho
                      ? `${formValues.maKho} - ${
                          selectedWarehouse?.tenKho || ''
                        }`
                      : 'Chọn kho'}
                  </Text>
                </Pressable>
              </View>

              {/* Locator */}
              <View className="flex-row items-center py-2">
                <Text className="text-gray-600 font-medium w-24">Locator:</Text>
                <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                  <Pressable
                    className="flex-1 justify-center"
                    onPress={() => setLocatorModal(true)}>
                    <Text
                      className={
                        formValues.maLocator ? 'text-gray-900' : 'text-gray-400'
                      }>
                      {formValues.maLocator
                        ? formValues.maLocator
                        : selectedLocator?.maLocator ||
                          'Chọn hoặc quét locator'}
                    </Text>
                  </Pressable>
                  <View className="flex-row">
                    {settings.useCameraScan && (
                      <Pressable
                        className="p-2"
                        onPress={() => {
                          setCameraField('locator');
                          setShowCameraModal(true);
                        }}>
                        <FontAwesomeIcon
                          icon={faCamera}
                          size={18}
                          color={AppColors.primary}
                        />
                      </Pressable>
                    )}
                    <Pressable
                      className="p-2"
                      onPress={() => {
                        setFormValues(p => ({...p, maLocator: ''}));
                        setSelectedLocator(null);
                      }}>
                      <FontAwesomeIcon
                        icon={faXmark}
                        size={18}
                        color="#9ca3af"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            {/* Section: Lines */}
            <View className="px-1">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-gray-900">
                  Danh sách
                </Text>
                <View className="flex-row space-x-2">
                  <Pressable
                    onPress={() => {
                      setEditIndex(null);
                      setCurrentLineEdit(null);
                      setCurrentLineForm({
                        maLocator: '',
                        maVatTu: '',
                        tenVatTu: '',
                        dvtGoc: '',
                        soLo: '',
                        soLuongKK: 0,
                      });
                      setLineModalOpen(true);
                    }}
                    className="bg-primary p-2 rounded-lg">
                    <FontAwesomeIcon icon={faAdd} size={18} color="white" />
                  </Pressable>
                </View>
              </View>
            </View>
            <View className="mb-10 rounded-lg overflow-hidden border border-gray-200">
              <GeneralTable
                data={formValues.lines}
                columns={columns}
                selectedColumns={selectedColumns}
                onRowPress={(item, index) => handleEdit(item, index)}
                renderCell={renderCustomCell}
              />
            </View>
          </ScrollView>
        </View>

        {/* Modals */}
        {warehouseModal && (
          <WarehouseModal
            handleOpenWarehouseModal={() => setWarehouseModal(false)}
            open={warehouseModal}
            warehouseList={warehouseList}
            handleGetWarehouse={w => {
              setSelectedWarehouse(w);
              setFormValues(p => ({...p, maKho: w.maKho}));
              setWarehouseModal(false);
            }}
          />
        )}
        {locatorModal && (
          <LocatorModal
            handleOpenLocatorModal={() => setLocatorModal(false)}
            open={locatorModal}
            locatorList={locatorList}
            handleGetLocator={l => {
              setSelectedLocator(l);
              setFormValues(p => ({...p, maLocator: l.maLocator}));
              setLocatorModal(false);
            }}
          />
        )}
        {lineModalOpen && (
          <StockTakeLineModal
            handleOpenLineModal={() => {
              setLineModalOpen(false);
            }}
            open={lineModalOpen}
            onSubmit={handleSubmitLine}
            data={currentLineForm}
            status={statusModalLine}
            setStatusLine={setStatusModalLine}
            maLocator={formValues.maLocator ?? ''}
          />
        )}
      </View>
      <DatePicker
        modal
        mode="date"
        open={openDate}
        date={formValues?.ngayKK ? new Date(formValues.ngayKK) : new Date()}
        locale="vi"
        onConfirm={date => {
          setOpenDate(false);
          setDateStockTake(date);
          setFormValues(prev => ({...prev, ngayKK: date}));
        }}
        title={'Thời gian kiểm kê'}
        onCancel={() => setOpenDate(false)}
      />
    </CameraScannerWrapper>
  );
};

export default StockTakeDetail;
