import {
  faTrash,
  faSave,
  faClipboardCheck,
  faClipboardList,
  faQrcode,
  faPrint,
  faGear,
  faAdd,
  faWarehouse,
  faMapMarked,
  faXmark,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  DeviceEventEmitter,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraScannerWrapper from '../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {settingStore} from '../../Store/settingStore';
import {getSettingValue} from '../Login/store/asyncUserStorage';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {getApi, postApi} from '../../Base/api/api_service';
import {device, formatDate} from '../../ults';
import {AppColors} from '../../../colors';
import {userAtom} from '../Login/store/userAtom';
import {loadingStore} from '../../Store/loadingStore';
import {useNavigation} from '@react-navigation/native';
import WarehouseLineModal from './Modal/WarehouseLineModal';
import SettingModal from '../Produce/Modal/SettingModal';
import DatePicker from 'react-native-date-picker';
import {
  LineWarehouseType,
  LocatorType,
  WarehouseType,
  TypeFormWarehouse,
} from './type';
import {
  WarehouseDetailAtom,
  WarehouseDetailID,
  WarehouseStatusTypeAtom,
} from './store';
import WarehouseModal from './Modal/WarehouseModal';
import WarehouseTypeModal from './Modal/WarehouseTypeModal';
import LocatorModal from './Modal/LocatorModal';
import GeneralTable from '../../Components/GeneralTable';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import HoneywellScanner from '../../Base/ScannerModule';
// import { WarehouseDetailStore } from './store';
// import WarehouseQRScanModal from './Modal/WarehouseQRScanModal';

const WarehouseDetail = () => {
  const navigate = useNavigation();
  const userStore = useRecoilValue(userAtom);
  const detailWarehouseValue = useRecoilValue(WarehouseDetailAtom);
  const warehouseDetailID = useRecoilValue(WarehouseDetailID);
  const warehouseStatusType = useRecoilValue(WarehouseStatusTypeAtom);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const [settings, setSettings] = useRecoilState(settingStore);
  const [fieldFocus, setFieldFocus] = useState('');
  const [settingModal, setSettingModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraField, setCameraField] = useState<string>('');
  const [openDate, setOpenDate] = useState(false);
  const [dateChuyenKho, setDateChuyenKho] = useState(new Date());
  const [currentLineForm, setCurrentLineForm] = useState<LineWarehouseType>({
    slXuat: '',
  } as LineWarehouseType);
  const [formValues, setFormValues] = useState<TypeFormWarehouse>({
    ngay: new Date().toISOString(),
    TinhTrang: 'draft',
    trangThaiKho: 'XUAT_CHUYEN_KHO',
    lines: [] as LineWarehouseType[],
  } as TypeFormWarehouse);

  // State giữ giá trị đối tượng phục vụ hiển thị tên (giữ nguyên cái cũ, thêm cái mới)
  const [warehouseList, setWarehouseList] = useState<WarehouseType[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseType | null>(null);
  const [selectedWarehouseXuat, setSelectedWarehouseXuat] =
    useState<WarehouseType | null>(null);

  const [selectedLocator, setSelectedLocator] = useState<LocatorType | null>(
    null,
  );
  const [selectedLocatorXuat, setSelectedLocatorXuat] =
    useState<LocatorType | null>(null);
  const [locatorList, setLocatorList] = useState<{
    NHAP: LocatorType[];
    XUAT: LocatorType[];
  }>({
    NHAP: [],
    XUAT: [],
  });

  // State dùng chung điều khiển Modal
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [locatorModal, setLocatorModal] = useState(false);

  // 🌟 THÊM 2 STATE ĐỂ BIẾT ĐANG MỞ MODAL CHO LUỒNG NÀO ('NHAP' hoặc 'XUAT')
  const [warehouseAction, setWarehouseAction] = useState<'NHAP' | 'XUAT'>(
    'NHAP',
  );
  const [locatorAction, setLocatorAction] = useState<'NHAP' | 'XUAT'>('NHAP');
  const [typeWarehouse, setTypeWarehouse] = useState('XUAT_CHUYEN_KHO');
  const [warehouseTypeModal, setWarehouseTypeModal] = useState(false);
  const [openModalLineDetail, setOpenModalLineDetail] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  //#region - Danh sách các cột muốn hiển thị mặc định
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
    {name: 'khoXuat', label: 'Kho xuất', width: 180},
    {name: 'viTriXuat', label: 'Vị trí xuất'},
    {name: 'khoNhap', label: 'Kho nhập', width: 180},
    {name: 'viTriNhap', label: 'Vị trí nhập'},
    {name: 'dvt', label: 'ĐVT', width: 70},
    {name: 'slXuat', label: 'Số lượng', width: 80},
    {name: 'ghiChu', label: 'Ghi chú', width: 220},
    {name: 'Actions_Right', label: 'Xóa', width: 50},
  ];
  // Hàm xử lý hiển thị cell đặc biệt
  const renderCustomCell = (columnName: string, item: any, index: number) => {
    // 4. Xử lý nút Xóa bên phải
    if (columnName === 'soLo') {
      return (
        <View key="STT" className="items-center justify-center">
          <Text className="text-gray-700">{item.soLo}</Text>
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

  const handleBack = () => {
    // setLineIndexItem(-1);
    navigate.goBack();
  };

  // 1. Tạo một biến Ref để đánh dấu xem Form đã được nạp dữ liệu ban đầu chưa
  const isFormInitialized = useRef(false);

  useEffect(() => {
    // 🌟 KHÓA CHẶT: Nếu form đã được khởi tạo dữ liệu một lần rồi thì KHÔNG CHẠY LẠI NUĂ
    if (isFormInitialized.current) return;

    // TRƯỜNG HỢP EDIT
    if (warehouseStatusType === 'EDIT') {
      if (warehouseDetailID) {
        handleGetWarehouseDetail(warehouseDetailID);

        if (formValues.maKhoNhap)
          setSelectedWarehouse({
            maKho: formValues.maKhoNhap,
            tenKho: formValues.khoNhap,
          } as any);
        if (formValues.maKhoXuat)
          setSelectedWarehouseXuat({
            maKho: formValues.maKhoXuat,
            tenKho: formValues.khoXuat,
          } as any);
        if (formValues.viTriNhap)
          setSelectedLocator({
            maLocator: formValues.viTriNhap,
          } as any);
        if (formValues.viTriXuat)
          setSelectedLocatorXuat({
            maLocator: formValues.viTriXuat,
          } as any);

        // Đánh dấu đã nạp xong dữ liệu EDIT
        isFormInitialized.current = true;
      }
    }

    // TRƯỜNG HỢP NEW
    else if (warehouseStatusType === 'NEW') {
      setFormValues({
        User: userStore.nameID || '',
        TinhTrang: 'draft',
        ngay: new Date().toISOString(),
        trangThaiKho: 'XUAT_CHUYEN_KHO',
        soDeNghi: '',
        ghiChu: '',
        maKhoXuat: '',
        khoXuat: '',
        viTriXuat: '',
        maKhoNhap: '',
        khoNhap: '',
        viTriNhap: '',
        lines: [], // Chỉ nạp mảng rỗng đúng lần đầu tiên khi mở trang tạo mới
      } as TypeFormWarehouse);

      setSelectedWarehouse(null);
      setSelectedWarehouseXuat(null);
      setSelectedLocator(null);
      setSelectedLocatorXuat(null);

      // Đánh dấu đã nạp xong cấu trúc trắng cho luồng NEW
      isFormInitialized.current = true;
    }

    // Theo dõi sát sao sự thay đổi thực sự của dữ liệu gốc truyền vào
  }, [warehouseStatusType, detailWarehouseValue]);

  // 2. Khi đóng trang (Unmount Component), reset lại cờ để lần sau vào lại trang sẽ nạp mới
  useEffect(() => {
    return () => {
      isFormInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    handleGetListWarehouse();
    loadSettings();
  }, []);

  const maKhoNhapHienTai = formValues?.maKhoNhap;
  const maKhoXuatHienTai = formValues?.maKhoXuat;

  useEffect(() => {
    if (maKhoNhapHienTai) {
      handleGetListLocator(maKhoNhapHienTai, 'NHAP');
    }
  }, [maKhoNhapHienTai]);

  useEffect(() => {
    if (maKhoXuatHienTai) {
      handleGetListLocator(maKhoXuatHienTai, 'XUAT');
    }
  }, [maKhoXuatHienTai]);

  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
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

  const handleQRCodeScanned = async (
    scannedQRCode: string,
    fieldFocus: string,
  ) => {
    const qrData = scannedQRCode ? scannedQRCode.trim() : '';
    // console.log(`🔍 [Xử lý QR] Dữ liệu: "${qrData}" | Luồng nhập (fieldFocus): "${fieldFocus}"`);

    if (!qrData) return;

    // =========================================================================
    // TRƯỜNG HỢP 1: QUÉT MÃ VẬT TƯ & SỐ LÔ (Chuỗi chứa dấu '#')
    // =========================================================================
    if (fieldFocus === 'qrCode' && qrData.includes('#')) {
      // Cắt chuỗi thành mảng dựa trên tất cả các dấu '#'
      // Ví dụ: ["01.00035", "PN012605.0009", "01.000035", "1"]
      const parts = qrData.split('#');

      // 1. Các ký tự trước dấu # đầu tiên (Phần tử index 0)
      const maVT = parts[0] ? parts[0].trim() : '';

      // 2. Các ký tự giữa dấu # đầu tiên và dấu # thứ hai (Phần tử index 1)
      const soLoID = parts[1] ? parts[1].trim() : '';

      console.log(
        `=> Phân tách QR thành công - Mã VT: [${maVT}] | Số lô: [${soLoID}]`,
      );

      console.log(`=> Lines :`, formValues?.lines);
      // Kiểm tra trùng lặp trong lưới chỉ tiêu lines
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
        // console.log(`=> Mã VT: [${maVT}] chưa có trong Lines`);
        // console.log(`=> Mã Kho xuất: [${formValues.maKhoXuat}]`);
        const newLine = await getVatTuByMaVTAndMaKho(
          qrData,
          formValues.maKhoXuat,
        );
        console.log(`=> newLine :`, newLine);
        if (newLine) {
          setFormValues((prevFormValues: any) => {
            // 🌟 BẪY AN TOÀN: Nếu prevFormValues.lines bị undefined, ta ép nó thành mảng rỗng []
            const currentLines = prevFormValues?.lines || [];

            return {
              ...prevFormValues,
              qrCode: qrData,
              // 🌟 Đã chuyển thành 'lines' chữ thường đồng bộ với Type mới của bạn
              lines: [
                ...currentLines, // Rải mảng an toàn, không lo crash app
                {
                  maVT: newLine.maVT,
                  soLoID: soLoID, // Biến số lô bạn cắt từ chuỗi QR ở trên
                  viTriNhap: formValues.viTriNhap || '',
                  viTriXuat: formValues.viTriXuat || '',
                  slXuat: '',
                  tenVT: newLine.tenVT,
                  dvt: newLine.dvt || '',
                  khoXuat: formValues.khoXuat || '',
                  khoNhap: formValues.khoNhap || '',
                  ghiChu: newLine.ghiChu || '',
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
    else if (fieldFocus === 'ViTriNhap') {
      // 🌟 SỬA: Tìm kiếm trong mảng .NHAP của Object locatorList mới
      const locationFilter = (locatorList.NHAP || []).find(
        (locator: LocatorType) => locator.maLocator === qrData,
      );

      if (locationFilter) {
        setSelectedLocator(locationFilter); // Cập nhật cả Object hiển thị cho ô giao diện
        setFormValues(prev => ({
          ...prev,
          viTriNhap: locationFilter.maLocator, // Cập nhật đúng key viết thường hệ thống
        }));
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: `Đã cấu hình vị trí: ${locationFilter.maLocator}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi vị trí',
          text2: `Không tìm thấy mã vị trí [${qrData}] trong hệ thống kho nhập`,
        });
      }
    }

    // =========================================================================
    // TRƯỜNG HỢP 3: QUÉT PHIẾU YÊU CẦU (soDeNghi hoặc qrCode)
    // =========================================================================
    else if (fieldFocus === 'soDeNghi') {
      setFormValues(prev => ({
        ...prev,
        // qrCode: qrData, // Cập nhật đồng thời qrCode và soDeNghi để đồng bộ giao diện
        soDeNghi: qrData,
      }));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Đã nhận diện Phiếu YC: ${qrData}`,
      });
    }
  };

  const loadSettings = async () => {
    try {
      const value = await getSettingValue();
      setSettings({useCameraScan: value});
      console.log('📱 Loaded camera setting from AsyncStorage:', value);
    } catch (error) {
      console.error('Error loading setting:', error);
    }
  };

  const handleGetWarehouseDetail = async (id: number) => {
    try {
      const url = `/inventory/warehouse/transfer/list/${id}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      // console.log('handleGetWarehouseDetail: ', item);
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

  const handleGetListLocator = async (maKho: string, type: 'NHAP' | 'XUAT') => {
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
        setLocatorList(prev => ({
          ...prev,
          [type]: list,
        }));
      }
    } catch (error) {
      console.error(`Lỗi lấy vị trí ${type}:`, error);
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleChangeInput = (value: any, field: string) => {
    console.log(`Input Changed - Field: ${field}, Value: ${value}`);
    // Cập nhật giá trị vào formValues
    setFormValues((prevValues: any) => {
      const currentLines = prevValues?.lines || [];
      return {
        ...prevValues,
        [field]: value,
        lines: currentLines,
      };
    });

    // Chỉ xử lý QR code hoặc ViTriNhap nếu fieldFocus tương ứng
    if (field === 'qrCode' || field === 'ViTriNhap') {
      handleQRCodeScanned(value, field);
    }
  };

  const handleEdit = (item: any, index: number) => {
    setCurrentLineForm(item);
    setEditIndex(index);
    // console.log("Editing item: ", index, item)
    setOpenModalLineDetail(true);
  };

  const handleDeleteItem = (index: number) => {
    // console.log("key delete: ", index)
    // Xóa dòng tại chỉ mục `index` khỏi `formValues.lines`
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      lines: prevFormValues.lines.filter((_, i) => i !== index),
    }));
  };

  const handleOpenSettingModal = () => {
    setSettingModal(!settingModal);
  };

  const handleWarehouseTypeModal = () => {
    setWarehouseTypeModal(!warehouseTypeModal);
  };

  const handleOpenLineModal = () => {
    // setNoteLine('');
    // setSlxuat(0);
    setOpenModalLineDetail(!openModalLineDetail);
  };

  const handleChangeTypeWarehouse = (value: string) => {
    if (value === 'XUAT_CHUYEN_KHO') {
      setFormValues((prevValues: any) => ({
        ...prevValues,
        trangThaiKho: value,
      }));
    } else {
      setFormValues((prevValues: any) => ({
        ...prevValues,
        khoNhap: '',
        maKhoNhap: '',
        trangThaiKho: value,
      }));
    }
  };

  const handleOpenLocatorModal = () => {
    setLocatorModal(!locatorModal);
  };

  const handleSaveModalLine = (newLine: LineWarehouseType) => {
    // console.log('>>> [Detail] Dữ liệu nhận từ Modal: ', newLine);

    setFormValues(prevFormValues => {
      const updatedLines = [...prevFormValues.lines];
      if (editIndex !== null) {
        // --- TRƯỜNG HỢP CHỈNH SỬA (LƯU ĐÈ) ---
        // Phá vỡ tham chiếu cũ bằng spread operator để Table re-render
        updatedLines[editIndex] = {
          ...updatedLines[editIndex],
          ...newLine,
          slXuat: newLine.slXuat || '', // Đảm bảo kiểu số
          ghiChu: String(newLine.ghiChu) || '',
        };
      } else {
        // --- TRƯỜNG HỢP THÊM MỚI ---
        updatedLines.push({
          ...newLine,
          slXuat: newLine.slXuat || '',
        });
      }

      return {
        ...prevFormValues,
        lines: updatedLines,
        qrCode: '',
      };
    });
    setOpenModalLineDetail(false);
    setEditIndex(null);
  };

  const handleClearQrcode = () => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      qrCode: '',
    }));
  };

  const handleScanResult = (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData, 'Field:', cameraField);
    if (cameraField === 'qrCode') {
      if (!formValues.maKhoXuat) {
        setTimeout(() => {
          Toast.show({
            type: 'error',
            text1: 'Vui lòng chọn Kho Xuất',
          });
        }, 1000);
        return;
      } else {
        handleQRCodeScanned(qrData, 'qrCode');
      }
    }
    if (cameraField === 'ViTriNhap') {
      handleQRCodeScanned(qrData, 'ViTriNhap');
    }
    if (cameraField === 'soDeNghi') {
      handleQRCodeScanned(qrData, 'soDeNghi');
    }

    if (cameraField === 'locator') {
      // 🌟 SỬA: Lấy từ locatorList.NHAP thay vì locatorList chung
      const locator = (locatorList.NHAP || []).find(
        (l: any) => l.maLocator === qrData,
      );
      if (locator) {
        setSelectedLocator(locator);
        setFormValues(prev => ({...prev, viTriNhap: locator.maLocator})); // Đồng bộ key viTriNhap viết thường
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy mã vị trí nhập',
        });
      }
    }

    // 🌟 THÊM BỔ SUNG: Trường hợp quét camera cho Vị trí xuất (nếu có dùng)
    if (cameraField === 'locatorXuat') {
      const locator = (locatorList.XUAT || []).find(
        (l: any) => l.maLocator === qrData,
      );
      if (locator) {
        setSelectedLocatorXuat(locator);
        setFormValues(prev => ({...prev, viTriXuat: locator.maLocator}));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy mã vị trí xuất',
        });
      }
    }
    setShowCameraModal(false);
    setCameraField('');
  };

  const handleSave = async (status: string) => {
    if (
      !formValues.maKhoNhap ||
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
      KhoNhap: formValues.khoNhap || '',
      KhoXuat: formValues.khoXuat || '',
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
      soDeNghi: formValues.soDeNghi || '',
      GhiChu: formValues.ghiChu || '',
      KhoNhap: formValues.khoNhap || '',
      KhoXuat: formValues.khoXuat || '',
      maKhoNhap: formValues.maKhoNhap,
      maKhoXuat: formValues.maKhoXuat,
      ViTriNhap: formValues.viTriNhap,
      ViTriXuat: formValues.viTriXuat,
      TinhTrang: status,
      TrangThaiKho: formValues.trangThaiKho || 'XUAT_CHUYEN_KHO',
      User: userStore.nameID || '',
      qrCode:
        formValues.qrCode ||
        (formattedLines[0]
          ? `${formattedLines[0].MaVT}#${formattedLines[0].SoLoID}`
          : ''),
      Lines: formattedLines,
    };

    // console.log("🚀 Dữ liệu gửi đi (submitData):", JSON.stringify(submitData, null, 2));

    try {
      const url = `/inventory/warehouse/transfer`;

      // Gọi API theo chuẩn async/await
      const resp = await postApi(url, submitData);

      // console.log("🔴 Kiểm tra phản hồi API thành công - Resp:", resp);

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
      // console.log("🔴 Kiểm tra phản hồi lỗi API - Err: ", err);
      console.log('🔴 Kiểm tra phản hồi lỗi API - Err: ', err);
      if (err.status === 400) {
        Toast.show({
          type: 'error',
          text1: err.message || 'Phiếu đã đóng, không được phép cập nhật.',
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

  const insets = useSafeAreaInsets();
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <View className="flex-1 bg-white" style={{paddingBottom: insets.bottom}}>
        <HeaderComponent
          backButton={true}
          handleBack={handleBack}
          // iconRight={
          //     <TouchableOpacity onPress={handleSave}>
          //         <FontAwesomeIcon icon={faSave} size={25} color={AppColors.primary} />
          //     </TouchableOpacity>
          // }
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
          title="Kho"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 p-3">
            {/* <Text style={{fontFamily: 'monospace'}} className="text-gray-900">
              {JSON.stringify(formValues, null, 2)}
            </Text> */}
            <View>
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
                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Loại phiếu:
                  </Text>

                  <Pressable
                    onPress={handleWarehouseTypeModal}
                    className="flex-1 bg-white border border-gray-300 rounded-lg h-11 justify-center px-3">
                    <Text
                      className={
                        formValues?.trangThaiKho
                          ? 'text-black'
                          : 'text-gray-400'
                      }>
                      {formValues?.trangThaiKho === 'XUAT_CHUYEN_KHO'
                        ? 'Xuất chuyển kho'
                        : 'Xuất kho'}
                    </Text>
                  </Pressable>
                </View>

                <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">Số ĐN:</Text>
                  <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                    <TextInput
                      className="flex-1 text-gray-600 h-full"
                      onChangeText={text => handleChangeInput(text, 'soDeNghi')}
                      onFocus={() => handleFocus('soDeNghi')}
                      value={formValues.soDeNghi}
                      placeholder="Vui lòng scan số DN"
                    />
                    <View className="flex-row">
                      {settings.useCameraScan && (
                        <Pressable
                          className="p-2"
                          onPress={() => {
                            setCameraField('soDeNghi');
                            setShowCameraModal(true);
                          }}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable className="p-2" onPress={() => {}}>
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
                    Kho Nhập:
                  </Text>
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={() => setWarehouseModal(true)}>
                    <Text
                      className={
                        formValues.khoNhap ? 'text-gray-900' : 'text-gray-400'
                      }>
                      {formValues.khoNhap
                        ? formValues.khoNhap
                        : 'Chọn kho nhập'}
                    </Text>
                  </Pressable>
                </View>

                <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Vị trí nhập:
                  </Text>
                  <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                    <Pressable
                      className="flex-1 justify-center"
                      onPress={() => setLocatorModal(true)}>
                      <Text
                        className={
                          formValues.viTriNhap
                            ? 'text-gray-900'
                            : 'text-gray-400'
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

                {/* ==================== KHO XUẤT & VỊ TRÍ XUẤT (MỚI THÊM) ==================== */}
                <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Kho Xuất:
                  </Text>
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={() => {
                      setWarehouseAction('XUAT');
                      setWarehouseModal(true);
                    }} // 🌟 Set luồng XUẤT
                  >
                    <Text
                      className={
                        formValues.khoXuat ? 'text-gray-900' : 'text-gray-400'
                      }>
                      {formValues.khoXuat
                        ? formValues.khoXuat
                        : 'Chọn kho xuất'}
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
                          formValues.viTriXuat
                            ? 'text-gray-900'
                            : 'text-gray-400'
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
                            setCameraField('locatorXuat');
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

                <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Mã Lot:
                  </Text>
                  <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                    <TextInput
                      className="flex-1 text-gray-600 h-full"
                      onChangeText={text => handleChangeInput(text, 'qrCode')}
                      onFocus={() => handleFocus('qrCode')}
                      value={formValues.qrCode}
                      placeholder="Vui lòng scan qrcode"
                    />
                    <View className="flex-row items-center">
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('qrCode');
                            setShowCameraModal(true);
                          }}
                          className="p-2">
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable onPress={handleClearQrcode} className="p-2">
                        <FontAwesomeIcon
                          icon={faXmark}
                          size={18}
                          color={AppColors.white}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Ghi chú:
                  </Text>

                  <TextInput
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 min-h-[60px] text-gray-600"
                    multiline={true}
                    placeholder="Nhập ghi chú"
                    onChangeText={text =>
                      setFormValues(prev => ({...prev, ghiChu: text}))
                    }
                    value={formValues?.ghiChu}
                  />
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
              <View className="mb-10 rounded-lg overflow-hidden border border-gray-200">
                <GeneralTable
                  data={formValues.lines || []}
                  columns={columns}
                  selectedColumns={selectedColumns}
                  onRowPress={(item, index) => {
                    handleEdit(item, index);
                  }}
                  renderCell={renderCustomCell}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {warehouseTypeModal && (
          <WarehouseTypeModal
            handleChangeTypeWarehouse={handleChangeTypeWarehouse}
            handleOpenWarehouseType={handleWarehouseTypeModal}
            open={warehouseTypeModal}
          />
        )}
        {openModalLineDetail ? (
          <WarehouseLineModal
            data={currentLineForm}
            handleOpenWarehouseLineModal={handleOpenLineModal}
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
              if (warehouseAction === 'NHAP') {
                // Điền cho bên Nhập
                setSelectedWarehouse(w);
                setFormValues(p => ({
                  ...p,
                  maKhoNhap: w.maKho,
                  khoNhap: w.tenKho,
                }));
              } else {
                // Điền cho bên Xuất
                setSelectedWarehouseXuat(w);
                setFormValues(p => ({
                  ...p,
                  maKhoXuat: w.maKho,
                  khoXuat: w.tenKho,
                }));
              }
              setWarehouseModal(false);
            }}
          />
        )}

        {locatorModal && (
          <LocatorModal
            handleOpenLocatorModal={() => setLocatorModal(false)}
            open={locatorModal}
            // 🌟 SỬA TẠI ĐÂY: Nếu đang mở vị trí NHẬP thì lấy list NHAP, ngược lại lấy list XUAT
            locatorList={
              locatorAction === 'NHAP' ? locatorList.NHAP : locatorList.XUAT
            }
            handleGetLocator={l => {
              if (locatorAction === 'NHAP') {
                setSelectedLocator(l);
                setFormValues(p => ({...p, viTriNhap: l.maLocator}));
              } else {
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
          title={'Ngày chuyển kho'}
          onCancel={() => setOpenDate(false)}
        />
      </View>
    </CameraScannerWrapper>
  );
};
export default WarehouseDetail;
