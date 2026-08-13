import {
  faCamera,
  faSave,
  faTrash,
  faXmark,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useRecoilState, useSetRecoilState, useRecoilValue} from 'recoil';
import {userAtom} from '../Login/store/userAtom';
import {getApi, postApi} from '../../Base/api/api_service';
import CameraScannerWrapper from '../../Base/CameraScannerWrapper/CameraScannerWrapper';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {getSettingValue} from '../Login/store/asyncUserStorage';
import {settingStore} from '../../Store/settingStore';
import {loadingStore} from '../../Store/loadingStore';
import WarehouseModal from '../WareHouse/Modal/WarehouseModal';
import {LocatorType, WarehouseType} from '../WareHouse/type';
import {formatDate} from '../../ults';
import {AppColors} from '../../../colors';
import GeneralTable, {TableColumn} from '../../Components/GeneralTable';
import DatePicker from 'react-native-date-picker';
import LocatorModal from '../WareHouse/Modal/LocatorModal';
import ChangeLocationWarehouseLineModal from './Modal/ChangeLocationWarehouseLineModal';
import SettingModal from '../Produce/Modal/SettingModal';
import {LineLotType, TypeFormChangeLocationWarehouse} from './type';
import {
  ChangeLocationWarehouseDetailAtom,
  ChangeLocationWarehouseDetailID,
  ChangeLocationWarehouseStatusTypeAtom,
} from './store';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ChangeLocationInWarehouseDetail = () => {
  const navigate = useNavigation();
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const [settings, setSettings] = useRecoilState(settingStore);
  const detailChangeLocationWarehouseValue = useRecoilValue(
    ChangeLocationWarehouseDetailAtom,
  );
  const changeLocationWarehouseDetailID = useRecoilValue(
    ChangeLocationWarehouseDetailID,
  );
  const ChangeLocationWarehouseStatusType = useRecoilValue(
    ChangeLocationWarehouseStatusTypeAtom,
  );
  const userStore = useRecoilValue(userAtom);

  // States cho Header
  const [qrCode, setQrCode] = useState('');
  const [currentLotCode, setCurrentLotCode] = useState(''); // Lưu Mã lot vừa quét[cite: 3]
  const [warehouseList, setWarehouseList] = useState<WarehouseType[]>([]);
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [locatorList, setLocatorList] = useState<LocatorType[]>([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraField, setCameraField] = useState<
    'qrCode' | 'viTriNhap' | 'viTriXuat' | ''
  >('');
  const [openDate, setOpenDate] = useState(false);
  const [dateChuyenKho, setDateChuyenKho] = useState(new Date());
  const [selectedLocator, setSelectedLocator] = useState<LocatorType | null>(
    null,
  );
  const [selectedLocatorXuat, setSelectedLocatorXuat] =
    useState<LocatorType | null>(null);
  const [locatorModal, setLocatorModal] = useState(false);
  const [locatorAction, setLocatorAction] = useState<'NHAP' | 'XUAT'>('NHAP');
  const [settingModal, setSettingModal] = useState(false);
  const [openModalLineDetail, setOpenModalLineDetail] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentLineForm, setCurrentLineForm] = useState<LineLotType>({
    slXuat: '',
    maLot: '',
  } as LineLotType);
  const [formValues, setFormValues] = useState<TypeFormChangeLocationWarehouse>(
    {
      TinhTrang: 'draft',
      ngay: new Date().toISOString(),
      trangThaiKho: 'CHUYEN_VI_TRI',
    } as TypeFormChangeLocationWarehouse,
  );

  const handleGetChangeLocationWarehouseDetail = async (id: number) => {
    try {
      const url = `/inventory/warehouse/transfer/list/${id}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      console.log('handleGetWarehouseDetail: ', item);
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
    if (ChangeLocationWarehouseStatusType === 'NEW') {
      setSelectedLocator(null);
      setSelectedLocatorXuat(null);
    } else {
      if (changeLocationWarehouseDetailID) {
        handleGetChangeLocationWarehouseDetail(changeLocationWarehouseDetailID);
        if (formValues && formValues.soCT) {
          setFormValues({
            ...formValues,
            trangThaiKho: formValues.trangThaiKho || 'CHUYEN_VI_TRI',
            lines: formValues.lines || [],
          });

          // if (formValues.maKhoNhap) setSelectedWarehouse({ maKho: formValues.maKhoNhap, tenKho: formValues.khoNhap } as any);
          // if (formValues.maKhoXuat) setSelectedWarehouseXuat({ maKho: formValues.maKhoXuat, tenKho: formValues.khoXuat } as any);
          if (formValues.viTriNhap)
            setSelectedLocator({
              maLocator: formValues.viTriNhap,
            } as any);
          if (formValues.viTriXuat)
            setSelectedLocatorXuat({
              maLocator: formValues.viTriXuat,
            } as any);
        }
      }
    }
    // Theo dõi sát sao sự thay đổi thực sự của dữ liệu gốc truyền vào
  }, [ChangeLocationWarehouseStatusType, detailChangeLocationWarehouseValue]);

  useEffect(() => {
    handleGetListWarehouse();
    loadSettings();
  }, []);

  useEffect(() => {
    handleGetListLocator(formValues?.maKhoXuat);
  }, [formValues?.maKhoXuat]);

  const loadSettings = async () => {
    try {
      const value = await getSettingValue();
      setSettings({useCameraScan: value});
    } catch (error) {
      console.error('Error loading setting:', error);
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

  const getVatTuByMaVTAndMaKho = async (id: string, maKho: string) => {
    try {
      if (!id) return;

      const body = {
        QRCode: id,
        MaKho: maKho,
      };
      const api = `/inventory/warehouse/transfer/item-qr`;

      const item = await postApi(api, body);
      if (!item) return;
      console.log('getVatTuByMaVTAndMaKho Data:', item);
      console.log('getVatTuByMaVTAndMaKho Data:', item.data[0]);
      if (item.status && item.data.length > 0) {
        const newLine = item.data[0];
        return newLine;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Thông báo',
          text2: item.Message || 'Không tìm thấy sản phẩm',
        });
      }
    } catch (error: any) {
      // Lúc này block catch ở Page đã hoạt động chuẩn xác!
      console.error('Lỗi đón được tại Page:', error);
      if (error.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Đường dẫn API hoặc Sản phẩm không tồn tại (404)',
        });
      }
    }
  };

  const handleEdit = (item: any, index: number) => {
    console.log('item Line edit: ', item);
    setCurrentLineForm(item);
    setEditIndex(index);
    setOpenModalLineDetail(true);
    console.log('nạp dữ liệu edit vào Modal: ', item);
  };

  const handleSaveModalLine = (newLine: LineLotType) => {
    // console.log('>>> [Detail] Dữ liệu nhận từ Modal: ', newLine);

    setFormValues(prevFormValues => {
      const updatedLines = [...prevFormValues.lines];
      if (editIndex !== null) {
        // --- TRƯỜNG HỢP CHỈNH SỬA (LƯU ĐÈ) ---
        // Phá vỡ tham chiếu cũ bằng spread operator để Table re-render
        updatedLines[editIndex] = {
          ...updatedLines[editIndex],
          ...newLine,
          // slGoc: Number(newLine.slGoc) || 0, // Đảm bảo kiểu số
          // slGD: Number(newLine.slGD) || 0,
          slXuat: newLine.slXuat || '',
          ghiChu: newLine.ghiChu || '', // Tránh undefined
        };
      } else {
        // --- TRƯỜNG HỢP THÊM MỚI ---
        updatedLines.push({
          ...newLine,
          // slGoc: Number(newLine.slGoc) || 0,
          // slGD: Number(newLine.slGD) || 0,
          slXuat: newLine.slXuat || '',
          ghiChu: newLine.ghiChu || '', // Tránh undefined
        });
      }

      return {
        ...prevFormValues,
        lines: updatedLines,
        qrCode: '', // Xóa mã QR ở Header sau khi lưu xong để tránh cache
      };
    });

    // Reset trạng thái sau khi lưu
    setOpenModalLineDetail(false);
    setEditIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    console.log('key delete: ', index);
    // Xóa dòng tại chỉ mục `index` khỏi `formValues.lines`
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      lines: prevFormValues.lines.filter((_, i) => i !== index),
    }));
  };

  const handleScanResult = (qrData: string) => {
    if (cameraField === 'qrCode') {
      setQrCode(qrData);
      handleQRCodeScanned(qrData, 'qrCode'); // 🌟 SỬA: Thêm tham số thứ 2 'qrCode' ở đây
    }
    if (cameraField === 'viTriNhap') {
      const locator = locatorList.find(l => l.maLocator === qrData);
      if (locator) {
        setFormValues(prev => ({...prev, viTriNhap: locator.maLocator}));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy vị trí',
        });
      }
    }
    if (cameraField === 'viTriXuat') {
      const locator = locatorList.find(l => l.maLocator === qrData);
      if (locator) {
        setFormValues(prev => ({...prev, viTriXuat: locator.maLocator}));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy vị trí',
        });
      }
    }
    setShowCameraModal(false);
    setCameraField('');
  };

  const handleQRCodeScanned = async (
    scannedQRCode: string,
    fieldFocus: string,
  ) => {
    const qrData = scannedQRCode ? scannedQRCode.trim() : '';
    if (!qrData) return;

    // =========================================================================
    // TRƯỜNG HỢP 1: QUÉT MÃ VẬT TƯ & SỐ LÔ (Chuỗi chứa dấu '#')
    // =========================================================================
    if (fieldFocus === 'qrCode' && qrData.includes('#')) {
      const parts = qrData.split('#');
      const maVT = parts[0] ? parts[0].trim() : '';
      const soLoID = parts[1] ? parts[1].trim() : '';
      const maLot = qrData.includes('#')
        ? qrData.split(/#(.*)/s)[1]?.trim()
        : '';

      const isExisting = formValues?.lines?.some(
        line => line.maVT === maVT && line.soLoID === soLoID,
      );

      if (isExisting) {
        setTimeout(() => {
          Toast.show({
            type: 'error',
            text1: 'Mã QR đã tồn tại',
            text2: 'Vật tư và số lô này đã được quét trước đó.',
          });
        }, 1000);
        return;
      } else {
        const newLine = await getVatTuByMaVTAndMaKho(
          qrData,
          formValues.maKhoXuat,
        );
        if (newLine) {
          setCurrentLotCode(maLot);
          setFormValues((prevFormValues: any) => {
            const currentLines = prevFormValues?.lines || [];
            return {
              ...prevFormValues,
              qrCode: qrData,
              maLot: maLot,
              lines: [
                ...currentLines,
                {
                  maVT: newLine.maVT || maVT,
                  soLoID: soLoID,
                  maLot: maLot,
                  viTriNhap: formValues.viTriNhap || '',
                  viTriXuat: formValues.viTriXuat || '',
                  slXuat: '',
                  tenVT: newLine.tenVT,
                  dvt: newLine.dvt || '',
                  khoXuat: formValues.khoXuat || '',
                  khoNhap: formValues.khoXuat || '',
                  ghiChu: '',
                },
              ],
            };
          });
        }
      }
    }

    // =========================================================================
    // TRƯỜNG HỢP 2: QUÉT VỊ TRÍ NHẬP (ViTriNhap)
    // =========================================================================
    if (fieldFocus === 'ViTriNhap') {
      // 🌟 SỬA: locatorList hiện tại là mảng phẳng, dùng trực tiếp không qua .NHAP
      const locationFilter = (locatorList || []).find(
        (locator: LocatorType) => locator.maLocator === qrData,
      );

      if (locationFilter) {
        setSelectedLocator(locationFilter);
        setFormValues(prev => ({
          ...prev,
          viTriNhap: locationFilter.maLocator,
        }));
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: `Đã cấu hình vị trí nhập: ${locationFilter.maLocator}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi vị trí',
          text2: `Không tìm thấy mã vị trí [${qrData}] trong danh mục kho`,
        });
      }
    }
    if (fieldFocus === 'ViTriXuat') {
      // 🌟 SỬA: locatorList hiện tại là mảng phẳng, dùng trực tiếp không qua .NHAP
      const locationFilter = (locatorList || []).find(
        (locator: LocatorType) => locator.maLocator === qrData,
      );

      if (locationFilter) {
        setSelectedLocator(locationFilter);
        setFormValues(prev => ({
          ...prev,
          viTriXuat: locationFilter.maLocator,
        }));
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: `Đã cấu hình vị trí nhập: ${locationFilter.maLocator}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi vị trí',
          text2: `Không tìm thấy mã vị trí [${qrData}] trong danh mục kho`,
        });
      }
    }
  };

  const handleOpenSettingModal = () => {
    setSettingModal(!settingModal);
  };

  const handleOpenLineModal = () => {
    setOpenModalLineDetail(!openModalLineDetail);
  };

  //#region columns cho table
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'maVT',
    'tenVT',
    'soLoID',
    'khoXuat',
    'viTriXuat',
    'khoNhap',
    'viTriNhap',
    'dvt',
    'slXuat',
    'ghiChu',
    'Actions_Right',
  ]);

  const columns = [
    {name: 'STT', label: 'STT'},
    {name: 'maVT', label: 'Mã vật tư'},
    {name: 'tenVT', label: 'Tên vật tư', width: 220},
    {name: 'soLoID', label: 'Số lô', width: 120},
    {name: 'khoXuat', label: 'Kho', width: 180},
    {name: 'viTriXuat', label: 'Vị trí xuất'},
    {name: 'viTriNhap', label: 'Vị trí nhập'},
    {name: 'dvt', label: 'ĐVT', width: 70},
    {name: 'slXuat', label: 'Số lượng', width: 80},
    {name: 'ghiChu', label: 'Ghi chú', width: 220},
    {name: 'Actions_Right', label: 'Xóa', width: 50},
  ];

  const renderCustomCell = (columnName: string, item: any, index: number) => {
    if (columnName === 'soLoID') {
      return (
        <View key="STT" className="items-center justify-center">
          <Text className="text-gray-700">{item.soLoID}</Text>
        </View>
      );
    }
    if (columnName === 'tenVT') {
      return (
        <View style={{width: 220}} className="items-start justify-center px-2">
          <Text className="text-left text-gray-700 font-medium">
            {item.tenVT}
          </Text>
        </View>
      );
    }
    if (columnName === 'ghiChu') {
      return (
        <View style={{width: 220}} className="items-start justify-center px-2">
          <Text className="text-left text-gray-700">{item.ghiChu}</Text>
        </View>
      );
    }
    if (columnName === 'Actions_Right') {
      return (
        <TouchableOpacity onPress={() => handleDeleteItem(index)}>
          <FontAwesomeIcon icon={faTrash} size={22} color={AppColors.error} />
        </TouchableOpacity>
      );
    }
    // Các cột mặc định
    return <Text className="text-gray-700">{item[columnName]}</Text>;
  };
  //#endregion

  const handleSave = async (status: string) => {
    if (
      !formValues.maKhoXuat ||
      !formValues.trangThaiKho ||
      formValues.lines.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập đầy đủ thông tin',
      });
      return;
    }
    setLoadingAtom(true);

    // 1. Đồng bộ lại dữ liệu của từng dòng trong Lines
    const formattedLines = (formValues.lines || []).map((line: any) => ({
      DVT: line.dvt || '',
      GhiChu: line.ghiChu || '',
      KhoNhap: formValues.khoXuat,
      KhoXuat: formValues.khoXuat,
      MaLot: line.maLot || '',
      MaVT: line.maVT || '',
      SLXuat: line.slXuat ? Number(line.slXuat) : 0,
      SoLo: line.soLoID || '',
      SoLoID: line.soLoID || '',
      TenVT: line.tenVT || '',
      ViTriXuat: line.viTriXuat || formValues.viTriXuat || '',
      ViTriNhap: line.viTriNhap || formValues.viTriNhap || '',
    }));

    // 2. Gom dữ liệu submitData
    const submitData = {
      SoCT: formValues.soCT || '',
      ngay: formValues.ngay || new Date().toISOString(),
      GhiChu: formValues.ghiChu || '',
      KhoNhap: formValues.khoXuat,
      KhoXuat: formValues.khoXuat,
      maKhoNhap: formValues.maKhoXuat,
      maKhoXuat: formValues.maKhoXuat,
      ViTriNhap: formValues.viTriNhap,
      ViTriXuat: formValues.viTriXuat,
      TinhTrang: status,
      TrangThaiKho: formValues.trangThaiKho || 'CHUYEN_VI_TRI',
      User: userStore.nameID || '',
      qrCode:
        formValues.qrCode ||
        (formattedLines[0]
          ? `${formattedLines[0].MaVT}#${formattedLines[0].SoLoID}`
          : ''),
      Lines: formattedLines,
    };

    console.log(
      '🚀 Dữ liệu gửi đi (submitData):',
      JSON.stringify(submitData, null, 2),
    );

    try {
      const url = `/inventory/warehouse/transfer`;

      // Gọi API theo chuẩn async/await
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
    } catch (err: any) {
      // Khối catch này sẽ bắt được lỗi từ lệnh "throw error" trong postApi của bạn
      console.log('🔴 Kiểm tra phản hồi lỗi API - Err: ', err);
      if (err.status === 400) {
        Toast.show({
          type: 'error',
          text1: err.message || 'Phiếu đã đóng, không được phép cập nhật.',
        });
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
          title="Chuyển vị trí trong kho"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{padding: 2, paddingBottom: 50}}
            keyboardShouldPersistTaps="handled"
            className="flex-1 p-3">
            {/* <Text style={{fontFamily: 'monospace'}} className="text-gray-900">
              {JSON.stringify(formValues, null, 2)}
            </Text> */}
            {/* Section Header: Thông tin chung */}
            <View className="bg-gray-50 rounded-xl px-3 mb-4 border border-gray-100 shadow-sm">
              {formValues?.soCT ? (
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 pt-3">
                  <Text className="font-medium text-gray-600">Số phiếu:</Text>
                  <Text className="text-gray-800 font-bold mr-2">
                    {formValues.soCT}
                  </Text>
                </View>
              ) : (
                <View />
              )}
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">Ngày:</Text>
                <Pressable
                  onPress={() => setOpenDate(true)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                  <Text className="text-slate-800 text-right font-bold">
                    {formValues?.ngay
                      ? formatDate(new Date(formValues.ngay))
                      : formatDate(new Date())}
                  </Text>
                </Pressable>
              </View>
              {/* Kho Nhập */}
              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">Mã Kho:</Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg h-11 justify-center px-3"
                  onPress={() => setWarehouseModal(true)}>
                  <Text
                    className={
                      formValues.khoXuat ? 'text-black' : 'text-gray-400'
                    }>
                    {formValues.khoXuat || 'Chọn kho'}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Vị trí xuất:
                </Text>
                <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                  <Pressable
                    className="flex-1 justify-center"
                    onPress={() => {
                      setLocatorAction('XUAT');
                      setLocatorModal(true);
                    }}>
                    <Text
                      className={
                        formValues.viTriXuat ? 'text-gray-900' : 'text-gray-400'
                      }>
                      {formValues.viTriXuat
                        ? formValues.viTriXuat
                        : 'Chọn hoặc quét vị trí'}
                    </Text>
                  </Pressable>
                  <View className="flex-row">
                    {settings.useCameraScan && (
                      <Pressable
                        className="p-2"
                        onPress={() => {
                          setCameraField('viTriXuat');
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
                        setFormValues(p => ({...p, viTriXuat: ''}));
                        setSelectedLocatorXuat(null);
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

              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Vị trí nhập:
                </Text>
                <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                  <Pressable
                    className="flex-1 justify-center"
                    onPress={() => {
                      setLocatorAction('NHAP');
                      setLocatorModal(true);
                    }}>
                    <Text
                      className={
                        formValues.viTriNhap ? 'text-gray-900' : 'text-gray-400'
                      }>
                      {formValues.viTriNhap
                        ? formValues.viTriNhap
                        : 'Chọn hoặc quét vị trí'}
                    </Text>
                  </Pressable>
                  <View className="flex-row">
                    {settings.useCameraScan && (
                      <Pressable
                        className="p-2"
                        onPress={() => {
                          setCameraField('viTriNhap');
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
                        setFormValues(p => ({...p, viTriNhap: ''}));
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

              {/* QRCode */}
              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-bold w-24">
                  QR Code VT:
                </Text>
                <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                  {/* <TextInput
                                        className="flex-1 h-full"
                                        placeholder="Vui lòng scan qrcode"
                                        value={qrCode}
                                        onChangeText={setQrCode}
                                        onSubmitEditing={() => handleGetQRCodeInfo(qrCode)}
                                    /> */}
                  <Pressable className="flex-1 justify-center">
                    <Text className="text-gray-400">
                      {formValues.qrCode
                        ? formValues.qrCode
                        : 'Quét QR Code VT'}
                    </Text>
                  </Pressable>
                  <View className="flex-row items-center">
                    {settings.useCameraScan && (
                      <Pressable
                        className="p-2"
                        onPress={() => {
                          setCameraField('qrCode');
                          setShowCameraModal(true);
                        }}>
                        <FontAwesomeIcon
                          icon={faCamera}
                          size={18}
                          color={AppColors.primary}
                        />
                      </Pressable>
                    )}
                    <Pressable className="p-2" onPress={() => setQrCode('')}>
                      <FontAwesomeIcon
                        icon={faXmark}
                        size={18}
                        color="#9ca3af"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Mã lot (Thay đổi từ Mã cuộn)[cite: 3] */}
              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-600 font-bold w-24">Mã lot:</Text>
                <Text className="flex-1 text-cyan-800 font-bold px-1">
                  {currentLotCode || '---'}
                </Text>
              </View>

              {/* Ghi chú */}
              <View className="flex-row items-center py-2 mb-1">
                <Text className="text-gray-600 font-bold w-24">Ghi chú:</Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 min-h-[60px] text-gray-600"
                  placeholder="Nhập ghi chú"
                  multiline
                  value={formValues.ghiChu}
                  onChangeText={t => setFormValues(p => ({...p, ghiChu: t}))}
                />
              </View>
            </View>

            {/* Section Table: Danh sách mã Lot[cite: 3] */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-900">Danh sách</Text>
              <View className="flex-row space-x-2">
                <Pressable
                  onPress={handleOpenSettingModal}
                  style={{
                    backgroundColor: AppColors.primary,
                    padding: 10,
                    borderRadius: 10,
                  }}>
                  <FontAwesomeIcon
                    icon={faGear}
                    size={15}
                    color={AppColors.white}
                  />
                </Pressable>
              </View>
            </View>
            <View className="mb-10 rounded-lg border border-gray-200">
              <GeneralTable
                data={formValues.lines}
                columns={columns}
                selectedColumns={selectedColumns}
                onRowPress={(item, index) => handleEdit(item, index)}
                renderCell={renderCustomCell}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {openModalLineDetail ? (
          <ChangeLocationWarehouseLineModal
            data={currentLineForm}
            handleOpenChangeLocationWarehouseLineModal={handleOpenLineModal}
            onSubmit={handleSaveModalLine}
            open={openModalLineDetail}
            title={
              editIndex !== null ? 'Chỉnh sửa sản phẩm' : 'Thông tin sản phẩm'
            }
          />
        ) : null}

        {warehouseModal && (
          <WarehouseModal
            handleOpenWarehouseModal={() => setWarehouseModal(false)}
            open={warehouseModal}
            warehouseList={warehouseList}
            handleGetWarehouse={w => {
              setFormValues(p => ({
                ...p,
                maKhoXuat: w.maKho,
                khoXuat: w.tenKho,
              }));
              setWarehouseModal(false);
            }}
          />
        )}

        <DatePicker
          modal
          mode="date"
          open={openDate}
          date={formValues?.ngay ? new Date(formValues.ngay) : new Date()}
          locale="vi"
          onConfirm={date => {
            setOpenDate(false);
            setDateChuyenKho(date);
            setFormValues(prev => ({...prev, ngay: date.toISOString()}));
          }}
          title={'Ngày chuyển'}
          onCancel={() => setOpenDate(false)}
        />
        {locatorModal && locatorList && locatorList.length > 0 && (
          <LocatorModal
            handleOpenLocatorModal={() => setLocatorModal(false)}
            open={locatorModal}
            locatorList={locatorList} // Sẽ tự động lấy list đã nạp tương ứng từ useEffect kho
            handleGetLocator={l => {
              if (locatorAction === 'NHAP') {
                // Điền vị trí nhập
                setSelectedLocator(l);
                setFormValues(p => ({...p, viTriNhap: l.maLocator}));
              } else {
                // Điền vị trí xuất
                setSelectedLocatorXuat(l);
                setFormValues(p => ({...p, viTriXuat: l.maLocator}));
              }
              setLocatorModal(false);
            }}
          />
        )}
        {settingModal && (
          <SettingModal
            handleOpenSettingModal={handleOpenSettingModal}
            onSubmit={() => {}}
            open={settingModal}
            title="Cài đặt hiển thị"
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
            columns={columns}
          />
        )}
      </View>
    </CameraScannerWrapper>
  );
};

export default ChangeLocationInWarehouseDetail;
