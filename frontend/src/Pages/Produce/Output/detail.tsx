// Existing imports
import {
  Alert,
  DeviceEventEmitter,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faAdd,
  faCamera,
  faChevronRight,
  faCopy,
  faGear,
  faPrint,
  faQrcode,
  faSave,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  device,
  formatDate,
  formatStringUpcase,
  formatTime,
} from '../../../ults';
import {AppColors} from '../../../../colors';
import {useNavigation} from '@react-navigation/native';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  AddressIpPrinterAtom,
  ProduceAtomType,
  ProduceDetailAtom,
  ProduceDetailID,
} from '../store';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {settingStore} from '../../../Store/settingStore';
import {useEffect, useState} from 'react';
import HoneywellScanner from '../../../Base/ScannerModule';
import {
  ProductSemiProductType,
  ProductionShiftType,
  LaneType,
  TypeFormProduce,
  MachineType,
  ModalPrinterType,
  StaffType,
  ProduceLineForm,
  StateType,
  HeaderOut,
  MaterialType,
} from '../type';
import ProductionShiftModal from '../Modal/ProductionShiftModal';
import StateModalList from '../Modal/StateModal';
import {getApi, postApi} from '../../../Base/api/api_service';
import Toast from 'react-native-toast-message';
import {loadingStore} from '../../../Store/loadingStore';
import {getSettingValue} from '../../Login/store/asyncUserStorage';
import SettingModal from '../Modal/SettingModal';
import ThermalPrinterModule from 'react-native-thermal-printer';
import TcpSocket from 'react-native-tcp-socket';
import PrinterModal from '../Modal/PrinterModal';
import ErrorModal from '../Modal/ErrorModal';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeneralTable, {TableColumn} from '../../../Components/GeneralTable';
import DatePicker from 'react-native-date-picker';
import MachineModal from '../Modal/MachinesModal';
import StaffModal from '../Modal/StaffModal';
import MaterialModalList from '../Modal/MaterialModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const OutputDetailProduceNavigate = () => {
  // Atom
  const [produceDetailAtom, setProduceDetailAtom] =
    useRecoilState(ProduceDetailAtom);
  const [typeProduceAtom, setTypeProduceAtom] = useRecoilState(ProduceAtomType);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const produceAtom = useRecoilValue(ProduceDetailAtom);
  const produceDetailID = useRecoilValue(ProduceDetailID);
  const [settings, setSettings] = useRecoilState(settingStore);

  // State
  const [machines, setMachines] = useState<MachineType[]>([]);
  const [machineValue, setMachineValue] = useState<MachineType>({
    maThietBi: '',
    tenThietBi: 'Vui lòng chọn',
  });
  const [machinesModal, setMachinesModal] = useState(false);
  const handleOpenMachineModal = () => {
    const hasCongDoan =
      form?.headerOut?.congDoan || form?.headerOut?.tenCongDoan;
    if (!hasCongDoan) {
      Alert.alert(
        'Thông báo', // Tiêu đề alert
        'Vui lòng chọn Công đoạn trước khi chọn Mã máy!', // Nội dung nhắc nhở
        [{text: 'Đồng ý', style: 'default'}], // Nút bấm đóng alert
      );
      return; // Chặn lại, không cho chạy xuống logic mở modal phía dưới
    } else {
      setMachinesModal(!machinesModal);
    }
  };

  const [modalNvsx, setModalNvsx] = useState(false);
  const [nvsxValue, setNvsxValue] = useState<StaffType>({
    maNV: '',
    tenBoPhan: '',
    tenNV: 'Vui lòng chọn',
  });
  const [nvKiemValue, setNvKiemValue] = useState<StaffType>({
    maNV: '',
    tenBoPhan: '',
    tenNV: 'Vui lòng chọn',
  });
  const [nvsx, setNvsx] = useState<StaffType[]>([]);
  const [typeNV, setTypeNV] = useState('SX');
  const handleModalNvsx = () => setModalNvsx(!modalNvsx);

  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [stateModal, setStateModal] = useState(false);
  const [productionShiftModal, setProductionShiftModal] = useState(false);
  const [productionShift, setProductionShift] = useState<ProductionShiftType[]>(
    [],
  );
  const [state, setState] = useState<StateType[]>([]);
  const [printerModal, setPrinterModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateSx, setDateSx] = useState(new Date());
  const [fieldFocus, setFieldFocus] = useState('');
  const [settingModal, setSettingModal] = useState(false);
  const [newLineModal, setNewLineModal] = useState(false);
  const [statusModalLine, setStatusModalLine] = useState('NEW');
  const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
  const [khoTKCatLine, setKhoTKCatLine] = useState<number>(0);
  const [listMaterial, setListMaterial] = useState([]);
  const [materialModal, setMaterialModal] = useState(false);
  const [materialValue, setMaterialValue] = useState<MaterialType>({
    tenVatTu: 'Chọn TP/BTP',
  } as MaterialType);

  const getAddressIpFromAtom = useRecoilValue(AddressIpPrinterAtom);
  const [ipPrinter, setIpPrinter] = useState('192.168.1.42');
  const [reloadLocalIp, setReloadLocalIp] = useState(false);
  const [reload, setReload] = useState(0);
  const navigate = useNavigation();
  const [openTime, setOpenTime] = useState(false);
  const [time, setTime] = useState(new Date());

  const [valueFromPrinterModal, setValueFromPrinterModal] =
    useState<ModalPrinterType>();
  const [stateValue, setStateValue] = useState<StateType>({
    dienGiai: 'Chọn công đoạn',
  } as StateType);
  const [caSxValue, setProductionShiftValue] = useState<ProductionShiftType>({
    tenDoiTuong: 'Chọn ca',
  } as ProductionShiftType);
  const [form, setForm] = useRecoilState(ProduceDetailAtom);

  const handleGetProduceDetail = async (id: number) => {
    try {
      const url = `/mfg/production/list/one?loaiPhieu=OUT&headerID=${id}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      console.log('handleGetProduceDetail: ', item);

      if (item?.status === true && item?.data) {
        const rawData = item.data;
        setForm(rawData);
        setProduceDetailAtom(rawData);
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
    if (typeProduceAtom === 'EDIT' && produceDetailID) {
      handleGetProduceDetail(produceDetailID);
      setForm(
        prev =>
          ({
            ...prev,
            ngay: form.ngay ? new Date(form.ngay) : new Date(),
            caSX: form.caSX || 'Chọn ca',
          } as TypeFormProduce),
      );
    }
  }, [typeProduceAtom, produceDetailID]);
  // ✅ Load setting từ AsyncStorage khi component mount
  useEffect(() => {
    const loadSetting = async () => {
      try {
        const value = await getSettingValue();
        setSettings({useCameraScan: value});
        console.log('📱 Loaded camera setting from AsyncStorage:', value);
      } catch (error) {
        console.error('Error loading setting:', error);
      }
    };
    loadSetting();
  }, []);

  // useEffect
  useEffect(() => {
    if (HoneywellScanner.isCompatible) {
      HoneywellScanner.startReader();

      const subscription = DeviceEventEmitter.addListener(
        'barcodeReadSuccess',
        result => {
          const scannedQRCode = result.data;

          // Cập nhật giá trị QR code vào form
          // setForm((prevValues: any) => ({
          //     ...prevValues,
          //     LSX: scannedQRCode  // Hiển thị QR code trong trường LSX
          // }));
          handleQRCodeScanned(scannedQRCode);
        },
      );

      return () => {
        HoneywellScanner.stopReader();
        subscription.remove();
      };
    }
  }, [fieldFocus]);

  useEffect(() => {
    // Chỉ chạy khi form.lsx thực sự có dữ liệu chữ nghĩa đàng hoàng
    if (form.lsx && form.lsx !== 'undefined' && form.lsx.trim() !== '') {
      handleGetTPByLSX(form.lsx);
      console.log('🔄 LSX hợp lệ, tiến hành load CaSX, Công đoạn...');
      handleGetProductionShift();
      handleGetState();
    }
  }, [form.lsx]);

  const handleCheckTypeTem = (type: number) => {
    switch (type) {
      case 1:
        return 'TemBtpCD';
      case 2:
        return 'temThoi';
      case 3:
        return 'TemTpThoi';
      case 4:
        return 'TemMangTp';
      case 5:
        return 'TemTuiTp';
      case 6:
        return 'TemTpZipper';
      case 7:
        return 'TemLoi';
      case 8:
        return 'TemTuiTpHuyHoang';
    }
  };
  useEffect(() => {
    if (getAddressIpFromAtom !== '') {
      setIpPrinter(getAddressIpFromAtom);
    } else {
      DeviceInfo.getIpAddress().then(ip => {
        setIpPrinter(ip);
      });
    }
  }, []);
  useEffect(() => {
    let isMounted = true;
    // console.log("userToken: ", userToken);

    const getData = async () => {
      try {
        const jsonValue: any = await AsyncStorage.getItem('ipPrinterLocal');
        if (isMounted && jsonValue) {
          try {
            const parseValue = JSON.parse(jsonValue);
            // console.log('jsonValue: ', parseValue);

            if (parseValue.ipPrinter) {
              // console.log('ipPrinterLocal in detail: ', parseValue);
              setIpPrinter(parseValue.ipPrinter);
              // setUserToken(parseValue); // Uncomment if needed
            }
          } catch (error) {
            console.error('Error parsing jsonValue:', error);
          }
        }
      } catch (e) {
        // error reading value
        console.log('e: ', e);
      }
    };

    getData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [reloadLocalIp]);

  const handleBack = () => {
    setTypeProduceAtom('NEW');
    navigate.goBack();
  };

  const onSubmitMachine = (machine: MachineType) => {
    console.log('selectedMachine: ', machine);
    setMachineValue(machine);
    handleOnChange(machine.maThietBi, 'maMay');
    handleOnChange(machine.tenThietBi, 'tenMay');
    handleOpenMachineModal();
  };

  const PrinterData: ModalPrinterType[] = [
    {id: 1, value: 'Mẫu tem bán thành phẩm'},
    {id: 2, value: 'Mẫu tem thổi'},
    {id: 3, value: 'Mẫu tem thành phẩm thổi'},
    {id: 4, value: 'Mẫu tem thành phẩm màng'},
    {id: 5, value: 'Mẫu tem thành phẩm túi'},
    {id: 6, value: 'Mẫu tem thành phẩm Zipper'},
    {id: 7, value: 'Mẫu tem Lõi'},
    {id: 8, value: 'Mẫu tem thành phầm túi Huy Hoàng'},
  ];

  const handlePrint = async (lineId: number) => {
    if (valueFromPrinterModal && ipPrinter !== '') {
      // console.log('ipPrinter: ', ipPrinter);
      setLoadingAtom(true);
      try {
        // Gọi API để lấy mã ZPL từ server
        const loaiTem = handleCheckTypeTem(valueFromPrinterModal.id);
        const url = `/produce/convertHtmlToImage/${lineId}/${loaiTem}`;
        const item = await getApi(url, {});

        if (item && item.data) {
          const zplCommand = item.data;
          // console.log('zplCommand: ', zplCommand);

          // Tạo kết nối TCP tới máy in
          const options = {
            port: 9100, // Cổng của máy in
            host: ipPrinter, // IP của máy in (có thể bạn đã cấu hình trước đó)
          };

          const client = TcpSocket.createConnection(options, () => {
            console.log('Kết nối thành công đến máy in!');

            // Gửi mã ZPL tới máy in
            client.write(zplCommand);

            // Đóng kết nối sau khi gửi xong
            client.end();
          });

          // Xử lý khi gặp lỗi trong kết nối
          client.on('error', error => {
            console.error('Có lỗi kết nối với máy in:', error);
            setMessageError(error.toString());
            setOpenErrorModal(true);
            Toast.show({
              type: 'error',
              text1: 'Lỗi in',
              text2: 'Không thể kết nối với máy in',
            });
          });

          // Đóng kết nối
          client.on('close', () => {
            console.log('Đã đóng kết nối với máy in.');
          });
        } else {
          // Xử lý lỗi khi không nhận được dữ liệu ZPL từ API
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không nhận được dữ liệu in từ API',
          });
        }
      } catch (error) {
        console.error('Lỗi gọi API lấy mã ZPL:', error);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Gọi API lấy mã ZPL thất bại',
        });
      } finally {
        // Tắt loading sau khi hoàn tất quá trình in
        setLoadingAtom(false);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn mẫu tem trước khi in',
      });
    }
  };

  const handleOpenErrorModal = () => setOpenErrorModal(!openErrorModal);

  const handleQRCodeScanned = (scannedQRCode: string) => {
    const scannedQRCodeTrim = scannedQRCode.trim();
    console.log('🔍 Scanned QR Code:', scannedQRCodeTrim);

    // QR code chỉ chứa LSX (không split với #)
    setForm(prev => ({
      ...prev,
      lsx: scannedQRCodeTrim,
    }));
  };

  const handleOnChange = (value: any, field: string) => {
    setForm((prevValues: any) => {
      // 1. Trường hợp cập nhật dữ liệu từ ô nhập QR code
      if (field === 'qrCode') {
        const cleanText = value ? value.trim() : '';

        if (cleanText.length === 13) {
          console.log('>>> Đủ 13 ký tự, tiến hành xử lý QR:', cleanText);
          setTimeout(() => {
            handleQRCodeScanned(cleanText);
          }, 0);
        }

        return {
          ...prevValues,
          LSX: value,
        };
      }

      // 2. Danh sách các trường số/dữ liệu nằm bên trong object `headerOut`
      const headerFields = [
        'sldvtGoc',
        'khoTKCat',
        'slNet',
        'slGross',
        'slmd',
        'slM2',
        'tenCongDoan',
        'maMay',
        'nvSanXuat',
        'nvKiem',
      ];

      if (headerFields.includes(field)) {
        return {
          ...prevValues,
          headerOut: {
            ...(prevValues?.headerOut || {}), // Giữ lại các trường cũ trong headerOut
            [field]: value, // Cập nhật trường đang gõ
          },
        };
      }

      // 3. Nếu là các trường nằm ngoài cùng (Ví dụ: ghiChu)
      return {
        ...prevValues,
        [field]: value,
      };
    });
  };

  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };

  const handleStateModal = () => {
    if (form.lsx !== '') {
      setStateModal(!stateModal);
    } else {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    }
  };

  const handleMaterialModal = () => {
    if (form.lsx !== '') {
      setMaterialModal(!materialModal);
    } else {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    }
  };

  const handleProductionShiftModal = () => {
    if (form.lsx !== '') {
      setProductionShiftModal(!productionShiftModal);
    } else {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    }
  };

  const handleGetValueFromProductionShiftModal = (
    item: ProductionShiftType,
  ) => {
    setForm((prevValues: any) => ({
      ...prevValues,
      caSX: item.maDoiTuong,
      tenCaSX: item.tenDoiTuong,
    }));
    setProductionShiftValue(item);
  };

  const handleGetValueFromStateModal = (item: StateType) => {
    setForm((prevValues: any) => ({
      ...prevValues,
      headerOut: {
        ...prevValues.headerOut,
        MaCD: item.maCD,
        congDoan: item.congDoan.toString(),
        tenCongDoan: item.dienGiai,
        version: item.version,
      },
    }));
    setStateValue(item);
  };

  const handleGetValueFromMaterialModal = (item: MaterialType) => {
    setForm((prevValues: any) => ({
      ...prevValues,
      maVatTu: item.maVatTu,
      tenVatTu: item.tenVatTu,
      headerOut: {
        ...prevValues.headerOut,
        dvtGoc: item.dvt || '',
      },
    }));
    setMaterialValue(item);
  };

  const handleOpenSettingModal = () => {
    setSettingModal(!settingModal);
  };

  const handleClearQrcode = () => {
    setForm((prevValues: any) => ({
      ...prevValues,
      lsx: '',
    }));
    navigate.reset({
      index: 0,
      routes: [{name: 'OutputDetailProduce' as never}], // Tên của route hiện tại
    });
  };

  const handleScanResult = (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData);
    handleQRCodeScanned(qrData);
    setShowCameraModal(false);
  };

  const formatDecimal = (value: any): string => {
    // Nếu rỗng, null, undefined hoặc gõ chữ lỗi không phải là số
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === '' ||
      isNaN(Number(value))
    ) {
      return '0.0000';
    }
    // Ép kiểu số và lấy đúng 4 số sau dấu chấm
    return Number(value).toFixed(4);
  };

  const handleSave = async (status: string, bypass: boolean = false) => {
    if (!form.lsx || !form.maVatTu || !form.headerOut.congDoan) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2:
          'Vui lòng điền đầy đủ thông tin các trường bắt buộc trước khi lưu.',
      });
      return;
    }

    setLoadingAtom(true);
    try {
      const submitData = {
        soCT: form.soCT || '',
        LSX: form.lsx || '',
        CaSX: form.caSX || '',
        CongDoan: form.headerOut.congDoan || '',
        DVTGoc: form.headerOut.dvtGoc || '',
        slDVTGoc: Number(formatDecimal(form.headerOut.sldvtGoc)),
        SLMD: Number(formatDecimal(form.headerOut.slmd)),
        slNet: Number(formatDecimal(form.headerOut.slNet)),
        slGross: Number(formatDecimal(form.headerOut.slGross)),
        slM2: Number(formatDecimal(form.headerOut.slM2)),
        slgd: Number(formatDecimal(form.headerOut.slgd)),
        KhoTKCat: form.headerOut.khoTKCat || '',
        Lane: form.headerOut.lane || '',
        MaMay: form.headerOut.maMay || '',
        NVKiem: form.headerOut.nvKiem || '',
        NVSanXuat: form.headerOut.nvSanXuat || '',
        GhiChu: form.ghiChu || '',
        Ngay: combineDateAndTime(form.ngay, form.gio),
        TinhTrang: status,
        LoaiPhieu: 'OUT',
        tenVatTu: form.tenVatTu || '',
        maVatTu: form.maVatTu || '',
        // 🌟 THÊM TRƯỜNG DƯỚI ĐÂY: Truyền cờ BypassProcessTime vào body API
        BypassProcessTime: bypass,
      };

      console.log('submitData produce:', submitData);
      // return;
      const url = `/mfg/production/save`;

      const resp = await postApi(url, submitData);
      console.log('Kiểm tra phản hồi API thành công - Resp:', resp);

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
      console.log('Kiểm tra phản hồi lỗi API - Err:', err);

      // 🌟 TRƯỜNG HỢP 1: Lỗi 400 kèm vi phạm thời gian công nghệ (hopLe === false)
      if (err?.status === 400 && err?.data?.hopLe === false) {
        const thoiGianCongNghe = err?.data?.thoiGianCongNghe ?? 0;
        const thoiGianCho = err?.data?.thoiGianCho ?? 0;

        // Hiển thị Alert xác nhận trực quan
        Alert.alert(
          'Thời gian công nghệ không hợp lệ',
          `Thời gian chờ (${thoiGianCho} phút) < Thời gian công nghệ (${thoiGianCongNghe} phút).\n\nBạn vẫn muốn tiếp tục lưu phiếu này chứ?`,
          [
            {
              text: 'Không lưu',
              style: 'cancel',
              onPress: () =>
                console.log('❌ Người dùng đã hủy bỏ không lưu bypass'),
            },
            {
              text: 'Vẫn lưu',
              style: 'destructive',
              onPress: () => {
                console.log(
                  '🔄 Kích hoạt lưu đè (BypassProcessTime = true)...',
                );
                // Gọi đệ quy lại chính hàm handleSave với tham số bypass = true
                handleSave(status, true);
              },
            },
          ],
        );
      }
      // 🌟 TRƯỜNG HỢP 2: Lỗi 400 thông thường (VD: Phiếu đã đóng)
      else if (err?.status === 400) {
        Toast.show({
          type: 'error',
          text1: err.message || 'Phiếu đã đóng, không được phép cập nhật.',
        });
        handleBack();
      }
      // TRƯỜNG HỢP 3: Các lỗi hệ thống/mạng khác
      else {
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
      setLoadingAtom(false);
    }
  };

  const handlePrinterModal = () => {
    setPrinterModal(!printerModal);
  };

  const handleGetValueFromPrinter = (printer: ModalPrinterType, ip: string) => {
    setIpPrinter(ip);
    setValueFromPrinterModal(printer);
    handlePrinterModal();
  };

  const handleGetTPByLSX = async (lsx: string) => {
    try {
      const url = `/mfg/production/orders/${lsx}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      //   console.log('handleGetVTByLSX: ', `length: ${item.data.length}`, item);
      if (item?.status === true) {
        const _vt = item.data || [];
        setForm((prevValues: any) => ({
          ...prevValues,
          maTP_BTP: _vt.maVatTu,
          tenTP_BTP: _vt.tenVatTu,
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy VT',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGetProductionShift = async () => {
    setLoadingAtom(true);
    try {
      const url = `/mfg/production/shifts`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      // console.log("item getCaSX: ", item)
      if (item && item.length > 0) {
        setProductionShift(item);
        if (typeProduceAtom === 'EDIT') {
          const selectedCaSx: any = item.find(
            (value: any) => value.maDoiTuong === produceAtom.caSX,
          );
          setProductionShiftValue(selectedCaSx);
          // console.log('selectedCaSx: ', selectedCaSx);
          if (selectedCaSx) {
            setProductionShiftValue(selectedCaSx);
          }
        }
      } else {
        setProductionShift([]);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy sản phẩm',
        });
      }
    } catch (error) {
      setProductionShift([]);
      // console.error('Error fetching data:', error);
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleGetState = async () => {
    setLoadingAtom(true);
    try {
      const url = `/mfg/production/stages/${form.lsx}`;
      const item = await getApi(url, {});
      // console.log("handleGetState url: ", url);
      console.log('handleGetState: ', item);

      if (item && item.length > 0) {
        setState(item);
        if (typeProduceAtom === 'EDIT') {
          const selectedState = item.find(
            (state: StateType) => state.maCD === produceAtom.maCD,
          );
          // console.log('selectedState: ', selectedState);
          setStateValue(selectedState);
        }
      } else {
        // setState(FAKE_STATE_LIST);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy công đoạn',
        });
      }
    } catch (error: any) {
      // console.error('Error fetching data state:', error);
      if (error.status === 404) {
        // setState(FAKE_STATE_LIST);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: error.message ? error.message : 'Lỗi không tìm thấy công đoạn',
        });
      }
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleGetMachines = async () => {
    setLoadingAtom(true);
    if (
      !form?.headerOut?.congDoan ||
      !form?.headerOut.version ||
      !form?.maVatTu
    ) {
      setMachines([]);
      setLoadingAtom(false);
      return;
    }
    const url = `/machines/list?maVatTu=${form?.maVatTu}&version=${form?.headerOut.version}&congDoan=${form?.headerOut?.congDoan}`;
    const item = await getApi(url, {});
    // console.log("handleGetStaff url: ", url);
    console.log('handleGetMachines: ', item);

    if (item?.length > 0) {
      setMachines(item);
    } else {
      setMachines([]);
      Toast.show({
        type: 'error',
        text1: 'Rỗng',
        text2: 'Danh sách máy móc rỗng',
      });
    }

    setLoadingAtom(false);
  };

  const combineDateAndTime = (
    dateObj: Date | string | undefined,
    timeObj: Date | string | undefined,
  ): string => {
    const d = dateObj ? new Date(dateObj) : new Date();
    const t = timeObj ? new Date(timeObj) : new Date();

    // Lấy thông tin ngày tháng năm thực tế trên màn hình (Local)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    // Lấy thông tin giờ phút thực tế trên màn hình (Local)
    const hours = String(t.getHours()).padStart(2, '0');
    const minutes = String(t.getMinutes()).padStart(2, '0');
    const seconds = String(t.getSeconds()).padStart(2, '0');

    // 🎉 Trả về định dạng chuỗi ISO Local không chứa chữ Z ở cuối
    // Ví dụ hiển thị: "2026-07-02T16:48:00"
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const handleGoToDetail = () => {
    if (!form?.lsx || !form?.headerOut?.congDoan || !form?.caSX) {
      Alert.alert('Thông báo', 'Vui lòng chọn đủ thông tin để tiếp tục');
    } else {
      navigate.navigate('OutputDetail2Produce' as never);
    }
    // navigate.navigate('BagMakingMachineInfo' as never);
  };

  const insets = useSafeAreaInsets();
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      {/* Khởi tạo View cha với key ép render */}
      <View
        className="flex-1 bg-white"
        key={reload}
        style={{paddingBottom: insets.bottom}}>
        {/* Header */}
        <HeaderComponent
          backButton={true}
          handleBack={handleBack}
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
            typeProduceAtom === 'NEW'
              ? 'Tạo mới phiếu Sản xuất'
              : 'Chi tiết Sản xuất'
          }
        />

        <View className="flex-1 p-3">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* <Text style={{fontFamily: 'monospace'}} className="text-gray-900">
              {JSON.stringify(form, null, 2)}
            </Text> */}
            {/* Section: Thông tin chung */}
            <View className="bg-gray-50 rounded-xl px-2 mb-4 shadow-sm border border-gray-100">
              {form?.soCT ? (
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 pt-2">
                  <Text className="text-slate-800 text-right font-bold">
                    Số phiếu:
                  </Text>
                  <Text className="text-gray-800 font-bold mr-2">
                    {form.soCT}
                  </Text>
                </View>
              ) : (
                <View />
              )}

              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">Ngày:</Text>
                <Pressable
                  onPress={() => setOpenDate(true)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                  <Text className="text-slate-800 text-right font-bold">
                    {form?.ngay
                      ? formatDate(new Date(form.ngay))
                      : formatDate(new Date())}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                <Text className="text-slate-600 font-medium w-24">Giờ:</Text>
                {/* 💡 ĐÃ FIX VỊ TRÍ 2: Bọc hàm formatTime vào trong thẻ <Text> */}
                <Pressable
                  onPress={() => setOpenTime(true)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                  <Text className="text-slate-800 text-right font-bold">
                    {form?.ngay
                      ? formatTime(new Date(form.ngay), false)
                      : '--:--'}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  QRCode LSX:
                </Text>
                <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                  <TextInput
                    className="flex-1 h-full text-slate-800 focus:border-blue-500"
                    onChangeText={text => handleOnChange(text, 'qrCode')}
                    onFocus={() => handleFocus('qrCode')}
                    value={form.lsx}
                    placeholder="Vui lòng scan qrcode"
                  />
                  {settings.useCameraScan && (
                    <Pressable
                      onPress={() => setShowCameraModal(true)}
                      className="p-2">
                      <FontAwesomeIcon
                        icon={faCamera}
                        size={18}
                        color={AppColors.primary}
                      />
                    </Pressable>
                  )}
                  <Pressable onPress={handleClearQrcode} className="p-2">
                    <FontAwesomeIcon icon={faXmark} size={18} color="#9ca3af" />
                  </Pressable>
                </View>
              </View>

              {/* Ca SX Select */}
              <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">Ca SX</Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                  onPress={handleProductionShiftModal}>
                  <Text className="text-gray-800 text-right">
                    {form?.tenCaSX ? form.tenCaSX : 'Chọn ca'}
                  </Text>
                </Pressable>
              </View>

              {/* Công đoạn Select */}
              <View className="flex-row items-center py-2">
                <Text className="text-gray-600 font-medium w-24">
                  Công đoạn
                </Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                  onPress={handleStateModal}>
                  <Text className="text-gray-800 text-right">
                    {form?.headerOut?.tenCongDoan
                      ? form?.headerOut?.tenCongDoan
                      : stateValue
                      ? stateValue.dienGiai
                      : 'Chọn công đoạn'}
                  </Text>
                </Pressable>
              </View>

              {/* Loại mẫu in */}
              {/* <View className="flex-row items-center border-b border-gray-200 py-2">
                <Text className="text-gray-600 font-medium w-24">
                  Loại mẫu in
                </Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                  onPress={handlePrinterModal}>
                  <Text className="text-gray-800 text-right">
                    {valueFromPrinterModal?.value
                      ? valueFromPrinterModal.value
                      : 'Vui lòng chọn mẫu in'}
                  </Text>
                </Pressable>
              </View> */}

              {/* Ghi chú */}
              {/* <View className="flex-row py-2">
                <Text className="text-gray-600 font-medium w-24 mt-2">
                  Ghi chú:
                </Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 min-h-[60px] text-gray-800"
                  onFocus={() => handleFocus('ghiChu')}
                  onChangeText={text => handleOnChange(text, 'ghiChu')}
                  multiline={true}
                  textAlignVertical="top"
                  value={form.ghiChu}
                />
              </View> */}
            </View>

            <Pressable
              onPress={handleGoToDetail}
              className="flex-row justify-center items-center bg-primary py-3 px-2 rounded-lg mb-2">
              <Text className="text-white text-center mr-3">
                Chi tiết TP/BTP
              </Text>
              <FontAwesomeIcon icon={faChevronRight} size={16} color="white" />
            </Pressable>
          </ScrollView>
        </View>

        {/* Modals & Pickers */}
        {stateModal && (
          <StateModalList
            data={state}
            handleOpenStateModalList={handleStateModal}
            onSubmit={handleGetValueFromStateModal}
            open={stateModal}
            title="Chọn công đoạn"
          />
        )}
        {productionShiftModal && (
          <ProductionShiftModal
            data={productionShift}
            handleOpenProductionShiftModal={handleProductionShiftModal}
            onSubmit={handleGetValueFromProductionShiftModal}
            open={productionShiftModal}
            title="Chọn ca"
          />
        )}
        {printerModal && (
          <PrinterModal
            ipTextValue={ipPrinter}
            handleGetValue={handleGetValueFromPrinter}
            handlePrinterModal={handlePrinterModal}
            open={printerModal}
            reloadLocalIp={reloadLocalIp}
            setReloadLocalIp={setReloadLocalIp}
            PrinterData={PrinterData}
          />
        )}
        {openErrorModal && (
          <ErrorModal
            handleOpenErrorModal={handleOpenErrorModal}
            open={openErrorModal}
            title={'Lỗi kết nối máy in'}
            message={messageError}
          />
        )}
        <DatePicker
          modal
          mode="date"
          open={openDate}
          date={form?.ngay ? new Date(form.ngay) : new Date()}
          locale="vi"
          onConfirm={date => {
            setOpenDate(false);
            setDate(date);
            setForm(prev => ({...prev, ngay: date}));
          }}
          title={'Chọn ngày'}
          onCancel={() => setOpenDate(false)}
        />
        <DatePicker
          modal
          mode="time"
          open={openTime}
          date={form?.gio ? new Date(form.gio) : new Date()}
          locale="vi"
          is24hourSource="device"
          title={'Chọn giờ sản xuất'}
          onConfirm={date => {
            setOpenTime(false);
            setTime(date);
            setForm(prev => ({...prev, gio: date}));
          }}
          onCancel={() => {
            setOpenTime(false);
          }}
        />
      </View>
    </CameraScannerWrapper>
  );
};

export default OutputDetailProduceNavigate;
