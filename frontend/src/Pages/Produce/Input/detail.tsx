// Existing imports
import {
  Alert,
  DeviceEventEmitter,
  Keyboard,
  KeyboardAvoidingView,
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
  formatDecimalFour,
  formatStringUpcase,
} from '../../../ults';
import {useNavigation} from '@react-navigation/native';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {settingStore} from '../../../Store/settingStore';
import {useEffect, useMemo, useState} from 'react';
import HoneywellScanner from '../../../Base/ScannerModule';
import {
  AddressIpPrinterAtom,
  ProduceAtomType,
  ProduceDetailAtom,
  ProduceDetailID,
} from '../store';
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
  HeaderIn,
} from '../type';
import ProductionShiftModal from '../Modal/ProductionShiftModal';
import StateModalList from '../Modal/StateModal';
import {getApi, postApi} from '../../../Base/api/api_service';
import Toast from 'react-native-toast-message';
import {loadingStore} from '../../../Store/loadingStore';
import {getSettingValue} from '../../Login/store/asyncUserStorage';
import SettingModal from '../Modal/SettingModal';
import LineModalInput from '../Modal/LineModalInput';
import ErrorModal from '../Modal/ErrorModal';
import GeneralTable, {TableColumn} from '../../../Components/GeneralTable';
import DatePicker from 'react-native-date-picker';
import MachineModal from '../Modal/MachinesModal';
import StaffModal from '../Modal/StaffModal';
import {AppColors} from '../../../../colors';
import {WarehouseType} from '../../WareHouse/type';
import WarehouseModal from '../../WareHouse/Modal/WarehouseModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const InputDetailProduceNavigate = () => {
  const [typeProduceAtom, setTypeProduceAtom] = useRecoilState(ProduceAtomType);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const produceAtom = useRecoilValue(ProduceDetailAtom);
  const produceDetailID = useRecoilValue(ProduceDetailID);
  const [settings, setSettings] = useRecoilState(settingStore);
  const [warehouseList, setWarehouseList] = useState<WarehouseType[]>([]);
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [stateModal, setStateModal] = useState(false);
  const [productionShiftModal, setProductionShifModal] = useState(false);
  const [productionShift, setProductionShift] = useState<ProductionShiftType[]>(
    [],
  );
  const [state, setState] = useState<StateType[]>([]);
  const [printerModal, setPrinterModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState(new Date());

  const [stateValue, setStateValue] = useState<StateType>({
    dienGiai: 'Chọn công đoạn',
  } as StateType);
  // const [fromStateValue, setFromStateValue] = useState<StateType>({
  //   dienGiai: 'Chọn công đoạn',
  // } as StateType);
  // const [toStateValue, setToStateValue] = useState<StateType>({
  //   dienGiai: 'Chọn công đoạn',
  // } as StateType);
  // Thêm biến này để biết đang mở modal cho "Từ CĐ" hay "Đến CĐ"
  const [activeField, setActiveField] = useState<'FROM' | 'TO' | null>(null);
  const [modalStateData, setModalStateData] = useState<StateType[]>([]);

  const [productionShiftValue, setProductionShiftValue] =
    useState<ProductionShiftType>({
      tenDoiTuong: 'Chọn ca',
    } as ProductionShiftType);
  const [form, setForm] = useState<TypeFormProduce>({
    ngay: new Date(),
    headerIn: {} as HeaderIn,
    lines: [] as ProduceLineForm[],
  } as TypeFormProduce);
  const [line, setLine] = useState<ProduceLineForm>({
    maKho: '',
    ActionType: '',
  } as ProduceLineForm);

  const [fieldFocus, setFieldFocus] = useState('');
  const [settingModal, setSettingModal] = useState(false);
  const [newLineModal, setNewLineModal] = useState(false);
  const [statusModalLine, setStatusModalLine] = useState('NEW');
  const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  const navigate = useNavigation();

  const handleBack = () => {
    setTypeProduceAtom('NEW');
    navigate.goBack();
  };

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

  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'maBTP_TP',
    'tenVatTu',
    'soLo',
    'dvtGoc',
    'luongThucTe',
    'Actions_Right',
  ]);

  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT', width: 60},
    {name: 'maBTP_TP', label: 'NVL/BTP', width: 120},
    {name: 'tenVatTu', label: 'Tên NVL/BTP', width: 220},
    {name: 'soLo', label: 'Số lô', width: 150},
    {name: 'congDoan', label: 'Công đoạn', width: 150},
    {name: 'maKho', label: 'Mã kho', width: 150},
    {name: 'dvtGoc', label: 'DVT Gốc', width: 100},
    {name: 'luongThucTe', label: 'SL Xuất', width: 100},
    {name: 'ghiChu', label: 'Ghi chú', width: 150},
    {name: 'Actions_Right', label: 'Xóa', width: 50},
    // { name: "slKgNet", label: "Số Kg(net)", width: 100 },
    // { name: "slKgGross", label: "Số Kg(gross)", width: 110 },
    // { name: "khoTKCat", label: "Khổ TK/Cắt", width: 100 },
    // { name: "nvSanXuat", label: "Nhân viên SX", width: 150 },
    // { name: "nvKiem", label: "Nhân viên kiểm", width: 150 },
    // { name: "maMay", label: "Mã máy", width: 100 },
    // { name: "Machine", label: "Thiết bị", width: 150 },
    // { name: "matCorona", label: "Mặt Corona", width: 110 },
    // { name: "soLane", label: "Lane", width: 100 },
  ];

  const renderCustomCell = (columnName: string, item: any, index: number) => {
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

  const handleGetProduceDetail = async (id: number) => {
    try {
      const url = `/mfg/production/list/one?loaiPhieu=IN&headerID=${id}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      console.log('handleGetProduceDetail: ', item);

      if (item?.status === true && item?.data) {
        // 🌟 TIẾN HÀNH CHÈN ACTIONTYPE VÀO LINES
        const rawData = item.data;

        const updatedLines = (rawData.lines || []).map((line: any) => ({
          ...line,
          // Chèn ActionType bằng giá trị của typeProduceAtom (ví dụ: 'EDIT')
          // Nếu không có typeProduceAtom, mặc định gán là 'EDIT' để hệ thống nhận diện đúng dòng cũ
          ActionType: typeProduceAtom || 'EDIT',
        }));

        // Cập nhật lại state form với mảng lines mới sạch sẽ
        setForm({
          ...rawData,
          lines: updatedLines,
        });
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
            ...prev, // 🌟 Trải nhanh toàn bộ các trường (soCT, lsx, maCD, ghiChu, lines...)
            ngay: form.ngay ? new Date(form.ngay) : new Date(), // Ép kiểu Date an toàn
            caSX: form.caSX || 'Chọn ca',
            // congDoan: form.congDoan || "Chọn Công đoạn",
          } as TypeFormProduce),
      ); // Ép kiểu để triệt tiêu gạch đỏ TypeScript
    }
  }, [typeProduceAtom, produceDetailID]);

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
    if (typeProduceAtom === 'NEW' && form.lsx) {
      handleGetVTByLSX(form.lsx);
    }
    // Chỉ chạy khi form.lsx thực sự có dữ liệu chữ nghĩa đàng hoàng
    if (form.lsx && form.lsx !== 'undefined' && form.lsx.trim() !== '') {
      console.log('🔄 LSX hợp lệ, tiến hành load CaSX, Công đoạn...');
      handleGetProductionShift();
      handleGetState();
      handleGetListWarehouse();
    }
  }, [form.lsx]);

  useEffect(() => {
    if (form?.headerIn?.khoMacDinh) {
      setLine({
        maKho: form?.headerIn?.khoMacDinh || '',
      } as ProduceLineForm);
    }
  }, [form?.headerIn?.khoMacDinh]);

  useEffect(() => {
    if (state.length > 0) {
      console.log('Dữ liệu state sau khi cập nhật thành công: ', state);
    }
  }, [state]);

  useEffect(() => {
    // console.log("=== BEGIN EFFECT SLICE ===");
    // console.log("activeField hiện tại:", activeField);
    // console.log("Trạng thái mở Modal (stateModal):", stateModal);
    // console.log("Mảng gốc (state) đang có:", state?.length, "phần tử");

    // 1. Kiểm tra an toàn: Nếu không có mảng gốc, không làm gì cả
    if (!state || state.length === 0) {
      console.log("❌ Lỗi: Mảng gốc 'state' rỗng hoặc undefined!");
      setModalStateData([]);
      return;
    }

    // 2. Nếu người dùng đang chọn ô "CÔNG ĐOẠN TỪ" (FROM) -> Hiển thị toàn bộ mảng gốc
    if (activeField === 'FROM') {
      console.log('✅ Nhánh FROM: Hiển thị full mảng gốc.');
      setModalStateData(state);
      return;
    }

    // 3. Nếu người dùng đang chọn ô "CÔNG ĐOẠN ĐẾN" (TO)
    if (activeField === 'TO') {
      const cdTuRaw = form?.headerIn?.congDoanTu;
      console.log('Giá trị ô TỪ lấy từ Form (cdTuRaw):', cdTuRaw);

      // Nếu chưa chọn công đoạn TỪ, mảng hiển thị cho ĐẾN sẽ rỗng
      if (!cdTuRaw || cdTuRaw === '') {
        console.log(
          '⚠️ Cảnh báo: Chưa chọn công đoạn TỪ, trả về mảng rỗng cho ô ĐẾN.',
        );
        setModalStateData([]);
        return;
      }

      const currentFrom = Number(cdTuRaw);
      console.log('Giá trị ô TỪ sau khi ép kiểu Number:', currentFrom);

      if (isNaN(currentFrom)) {
        console.log(
          '❌ Lỗi: Ép kiểu Number bị lỗi NaN! Kiểm tra lại định dạng dữ liệu.',
        );
        setModalStateData([]);
        return;
      }

      // Tìm công đoạn lớn nhất (Max) trong mảng gốc
      const maxCongDoan = Math.max(
        ...state.map((s: any) => Number(s.congDoan)),
      );
      console.log(
        'Công đoạn lớn nhất (Max) tìm được trong hệ thống:',
        maxCongDoan,
      );

      // TRƯỜNG HỢP ĐẶC BIỆT: Nếu công đoạn TỪ đã là Max -> Mảng chỉ còn duy nhất phần tử đó
      if (currentFrom === maxCongDoan) {
        const maxItem = state.filter(
          (s: any) => Number(s.congDoan) === maxCongDoan,
        );
        console.log('🎯 Nhánh ĐẶC BIỆT (Từ = Max): Mảng trả về gồm:', maxItem);
        setModalStateData(maxItem);
        return;
      }

      // TRƯỜNG HỢP THƯỜNG: Cắt mảng từ sau công đoạn TỪ
      // Sắp xếp mảng gốc tăng dần để slice chính xác theo thứ tự dòng chảy công đoạn
      const sortedState = [...state].sort(
        (a: any, b: any) => Number(a.congDoan) - Number(b.congDoan),
      );

      // Tìm vị trí Index của công đoạn TỪ trong chuỗi quy trình
      const fromIndex = sortedState.findIndex(
        (s: any) => Number(s.congDoan) === currentFrom,
      );
      console.log(
        'Vị trí index của công đoạn TỪ trong mảng đã xếp hạng:',
        fromIndex,
      );

      if (fromIndex !== -1) {
        // Lấy từ vị trí sau FromIndex (fromIndex + 1) đến hết quy trình
        const slicedList = sortedState.slice(fromIndex + 1);
        console.log('🎉 KẾT QUẢ SLICE THÀNH CÔNG (Nhánh TO):', slicedList);
        setModalStateData(slicedList);
      } else {
        console.log(
          '❌ Thất bại: Không tìm thấy index tương ứng trong mảng sortedState.',
        );
        setModalStateData(state);
      }
    }
    console.log('=== END EFFECT SLICE ===');
  }, [state, activeField, form?.headerIn?.congDoanTu, stateModal]);

  const handleGetVTByLSX = async (lsx: string) => {
    try {
      const url = `/mfg/production/orders/${lsx}`;
      // console.log('url handleGetVTByLSX: ', url);
      const item = await getApi(url, {});
      // console.log('handleGetVTByLSX: ', item);
      if (item?.status === true) {
        const _vt = item.data || [];
        setForm((prevValues: any) => ({
          ...prevValues,
          maVatTu: _vt.maVatTu,
          tenVatTu: _vt.tenVatTu,
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

  // const handleGetState = async () => {
  //   setLoadingAtom(true);
  //   try {
  //     const url = `/mfg/production/stages/${form.lsx}`;
  //     const item = await getApi(url, {});
  //     // console.log("handleGetState url: ", url);
  //     console.log('handleGetState: ', item);

  //     if (item && item.length > 0) {
  //       setState(item);

  //       if (typeProduceAtom === 'EDIT') {
  //         const selectedFromState = item.find(
  //           (state: StateType) =>
  //             state.maCD === produceAtom.headerIn.congDoanTu,
  //         );
  //         if (selectedFromState) setFromStateValue(selectedFromState);

  //         // Tìm và set cho ô Đến CĐ (Tìm trên mảng finalItems mới)
  //         const selectedToState = item.find(
  //           (state: StateType) =>
  //             state.maCD === produceAtom.headerIn.congDoanDen,
  //         );
  //         if (selectedToState) setToStateValue(selectedToState);
  //       }
  //     } else {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Lỗi',
  //         text2: 'Không tìm thấy công đoạn',
  //       });
  //     }
  //   } catch (error: any) {
  //     // console.error('Error fetching data state:', error);
  //     if (error.status === 404) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Lỗi',
  //         text2: error.message ? error.message : 'Lỗi không tìm thấy công đoạn',
  //       });
  //     }
  //   } finally {
  //     console.log('Công đoạn đầy đủ: ', state);
  //     setLoadingAtom(false);
  //   }
  // };

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

  const handleOnChange = (value: any, field: string) => {
    setForm((prevValues: any) => {
      // Trường hợp cập nhật dữ liệu từ ô nhập QR code
      if (field === 'qrCode') {
        const cleanText = value ? value.trim() : '';

        // 1. Chỉ kích hoạt hàm xử lý xử lý KHI VÀ CHỈ KHI gõ/quét đủ 13 ký tự
        if (cleanText.length === 13) {
          console.log('>>> Đủ 13 ký tự, tiến hành xử lý QR:', cleanText);

          // Sử dụng setTimeout 0ms để đẩy hàm xử lý này ra khỏi luồng render UI, giúp ô nhập không bị khựng
          setTimeout(() => {
            handleQRCodeScanned(cleanText);
          }, 0);
        }

        // 2. Luôn luôn cập nhật chữ hiển thị lên ô Input để UI mượt mà
        return {
          ...prevValues,
          LSX: value,
        };
      }
      const headerFields = [
        'congDoanTu',
        'tenCongDoanTu',
        'congDoanDen',
        'tenCongDoanDen',
        'khoMacDinh',
        'slmd',
      ];

      if (headerFields.includes(field)) {
        return {
          ...prevValues,
          headerIn: {
            ...(prevValues?.headerIn || {}), // Giữ lại các trường cũ trong headerOut
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

  const handleProductionShiftModal = () => {
    if (form.lsx !== '') {
      setProductionShifModal(!productionShiftModal);
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

  // Chọn công đoạn từ và đến
  // const handleGetValueFromStateModal = (item: StateType) => {
  //   const maxCongDoan =
  //     state && state.length > 0
  //       ? Math.max(...state.map((s: any) => Number(s.congDoan)))
  //       : null;

  //   if (activeField === 'FROM') {
  //     const isMax =
  //       maxCongDoan !== null && Number(item.congDoan) === maxCongDoan;

  //     setForm((prevValues: any) => ({
  //       ...prevValues,
  //       headerIn: {
  //         ...(prevValues?.headerIn || {}), // Bảo vệ dữ liệu cũ khác của headerIn
  //         congDoanTu: item.congDoan.toString(),
  //         tenCongDoanTu: item.dienGiai.toString(),
  //         ...(isMax
  //           ? {
  //               congDoanDen: item.congDoan.toString(),
  //               tenCongDoanDen: item.dienGiai.toString(),
  //             }
  //           : {}),
  //       },
  //     }));

  //     setFromStateValue(item);
  //     if (isMax) setToStateValue(item);
  //   } else if (activeField === 'TO') {
  //     setForm((prevValues: any) => ({
  //       ...prevValues,
  //       headerIn: {
  //         ...(prevValues?.headerIn || {}), // Giữ lại congDoanTu vừa chọn trước đó
  //         congDoanDen: item.congDoan.toString(),
  //         tenCongDoanDen: item.dienGiai.toString(),
  //       },
  //     }));

  //     setToStateValue(item);
  //   }
  // };

  const handleGetValueFromStateModal = (item: StateType) => {
    setForm((prevValues: any) => ({
      ...prevValues,
      headerIn: {
        ...prevValues.headerIn,
        MaCD: item.maCD,
        congDoanDen: item.congDoan.toString(),
        tenCongDoanDen: item.dienGiai.toString(),
        version: item.version,
      },
    }));
    setStateValue(item);
  };

  const handleDeleteItem = (index: number) => {
    // Confirm deletion
    Alert.alert(
      'Chắc chắn muốn xóa',
      'Bạn có chắc chắn muốn xóa line này ?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => handleDelete(index)},
      ],
      {cancelable: true},
    );
  };

  const handleDelete = (index: number) => {
    // Remove line from form's Lines array
    setForm(prevForm => ({
      ...prevForm,
      lines: prevForm.lines.map(
        (item, i) =>
          i === index
            ? {...item, ActionType: 'DELETE'} // Tìm thấy đúng dòng cần xóa -> Gán ActionType = DELETE
            : item, // Các dòng khác giữ nguyên
      ),
    }));
  };

  const handleEdit = (item: ProduceLineForm, index: number) => {
    setStatusModalLine('EDIT');
    // console.log("setLine", item);

    setLine(item); // Set the line data to be edited
    setEditLineIndex(index); // Set the index of the line being edited
    setNewLineModal(true); // Open the modal
    // setKhoTKCatLine(item.khoTKCat);
  };

  const handleModalLine = () => {
    // 💡 BƯỚC 1: Nếu modal ĐANG MỞ -> Bấm nút này nghĩa là muốn ĐÓNG MODAL
    if (newLineModal) {
      setNewLineModal(false);
      // Trả trạng thái modal về mặc định khi đóng (nếu cần)
      setStatusModalLine('NEW');
      return;
    }

    // 💡 BƯỚC 2: Nếu modal ĐANG ĐÓNG -> Kiểm tra logic để MỞ MODAL
    if (statusModalLine === 'NEW') {
      if (
        !form?.lsx ||
        !form?.maVatTu ||
        !form?.tenVatTu ||
        // !form?.headerIn?.congDoanTu ||
        !form?.headerIn?.congDoanDen ||
        !form?.headerIn?.khoMacDinh
      ) {
        Alert.alert(
          'Thông báo',
          'Vui lòng chọn đủ thông tin trước khi thêm dòng',
        );
        return;
      }
      setLine({
        maKho: form?.headerIn?.khoMacDinh || '',
      } as ProduceLineForm);
      setNewLineModal(true);
    } else {
      // Trường hợp statusModalLine là 'EDIT' hoặc trạng thái khác và đang đóng
      setNewLineModal(true);
    }
  };

  const handleOpenSettingModal = () => {
    setSettingModal(!settingModal);
  };

  const handleSubmitLine = (newLine: ProduceLineForm) => {
    // Nếu tất cả các trường hợp hợp lệ, thêm hoặc cập nhật dòng
    if (statusModalLine === 'NEW') {
      // Thêm dòng mới vào danh sách
      setForm(prevForm => {
        // 💡 BẪY AN TOÀN: Nếu prevForm.lines bị undefined, ép nó về mảng rỗng []
        const currentLines = prevForm?.lines || [];

        return {
          ...prevForm,
          lines: [...currentLines, newLine], // Rải mảng an toàn
        };
      });
      setNewLineModal(false);
    } else if (statusModalLine === 'EDIT' && editLineIndex !== null) {
      // Cập nhật dòng đã tồn tại
      setForm(prevForm => {
        // 💡 BẪY AN TOÀN TƯƠNG TỰ CHO TRƯỜNG HỢP EDIT
        const currentLines = prevForm?.lines || [];
        const updatedLines = [...currentLines];

        updatedLines[editLineIndex] = newLine;
        return {
          ...prevForm,
          lines: updatedLines,
        };
      });
      setNewLineModal(false);
    }

    // Reset modal state sau khi xử lý
    setStatusModalLine('NEW');
    setEditLineIndex(null);
  };

  const handleClearQrcode = () => {
    setForm((prevValues: any) => ({
      ...prevValues,
      LSX: '',
    }));
    navigate.reset({
      index: 0,
      routes: [{name: 'InputDetailProduce' as never}], // Tên của route hiện tại
    });
  };

  const handleScanResult = (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData);
    handleQRCodeScanned(qrData);
    setShowCameraModal(false);
  };

  const handleSave = async (status: string) => {
    // console.log(form)
    // return
    if (!form.lsx || !form.maVatTu) {
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
        SoCT: form.soCT || '',
        LSX: form.lsx || '',
        CaSX: form.caSX || '',
        CongDoanTu: Number(form.headerIn.congDoanTu) || Number('0'),
        CongDoanDen: Number(form.headerIn.congDoanDen) || Number(''),
        SLMD: Number(form.headerIn.slmd) || 0,
        KhoMacDinh: form.headerIn.khoMacDinh || '',
        GhiChu: form.ghiChu || '',
        Ngay: form.ngay,
        TinhTrang: status,
        LoaiPhieu: 'IN',
        Lines: form.lines.map(line => ({
          id: line.id,
          ghiChu: line.ghiChu,
          maBTP_TP: line.maBTP_TP,
          tenVatTu: line.tenVatTu,
          DVTGoc: line.dvtGoc,
          // CongDoan: Number(line.congDoan) || Number('0'),
          CongDoan: Number(form.headerIn.congDoanDen) || Number('0'),
          soLo: line.soLo,
          MaKho: line.maKho,
          LuongThucTe: Number(line.luongThucTe),
          ActionType: line.ActionType || 'EDIT',
          // slM2: line.slM2,
        })),
      };
      console.log('submitData produce: ', submitData);
      const url = `/mfg/production/save`;
      // console.log("URL: ",url)
      //   return;

      const resp = await postApi(url, submitData);
      console.log('Kiểm tra phản hồi API thành công - Resp:', resp);

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
      console.log('Kiểm tra phản hồi lỗi API - Err: ', err);
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

  const insets = useSafeAreaInsets();
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
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
              {JSON.stringify(form, null, 2)}
            </Text> */}
            <View>
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

                {typeProduceAtom !== 'EDIT' ? (
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
                        <FontAwesomeIcon
                          icon={faXmark}
                          size={18}
                          color="#9ca3af"
                        />
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 pt-2">
                    <Text className="text-slate-800 text-right font-bold">
                      LSX:
                    </Text>
                    <Text className="text-gray-800 font-bold mr-2">
                      {form.lsx}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center border-b border-gray-200 py-4">
                  <Text className="text-gray-600 font-medium w-24">
                    Mã TP/BTP:
                  </Text>
                  <Text className="text-gray-800 font-bold mr-2">
                    {form?.maVatTu || '---'}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center border-b border-gray-200 py-4">
                  <Text className="text-gray-600 font-medium w-24">
                    Tên TP/BTP:
                  </Text>
                  <Text className="text-gray-800 font-bold mr-2 text-right flex-1">
                    {form?.tenVatTu || '---'}
                  </Text>
                </View>

                {/* Ca SX Select */}
                <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">Ca SX:</Text>
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={handleProductionShiftModal}>
                    <Text className="text-gray-800 text-right">
                      {form?.tenCaSX ? form?.tenCaSX : 'Chọn ca'}
                    </Text>
                  </Pressable>
                </View>

                {/* Công đoạn Select */}
                {/* <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">Từ CĐ:</Text>
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={() => {
                      setActiveField('FROM');
                      handleStateModal();
                    }}>
                    <Text className="text-gray-800 text-right">
                      {form.headerIn.tenCongDoanTu
                        ? form.headerIn.tenCongDoanTu
                        : fromStateValue
                        ? fromStateValue.dienGiai
                        : 'Chọn công đoạn'}
                    </Text>
                  </Pressable>
                </View> */}

                {/* <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Đến CĐ:
                  </Text>
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={() => {
                      setActiveField('TO');
                      handleStateModal();
                    }}>
                    <Text className="text-gray-800 text-right">
                      {form.headerIn.tenCongDoanDen
                        ? form.headerIn.tenCongDoanDen
                        : toStateValue
                        ? toStateValue.dienGiai
                        : 'Chọn công đoạn'}
                    </Text>
                  </Pressable>
                </View> */}
                <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Công đoạn:
                  </Text>
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={() => {
                      handleStateModal();
                    }}>
                    <Text className="text-gray-800 text-right">
                      {form.headerIn.tenCongDoanDen
                        ? form.headerIn.tenCongDoanDen
                        : stateValue
                        ? stateValue.dienGiai
                        : 'Chọn công đoạn'}
                    </Text>
                  </Pressable>
                </View>

                {/* <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">SL MD</Text>
                  <TextInput
                    className="flex-1 text-right bg-white border border-gray-300 rounded-lg h-11 px-3 text-slate-800"
                    keyboardType="numeric"
                    onChangeText={text => handleOnChange(text, 'slmd')}
                    value={
                      form?.headerIn?.slmd ? form.headerIn.slmd.toString() : ''
                    }
                  />
                </View> */}

                <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Mã Kho:
                  </Text>
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={() => setWarehouseModal(true)}>
                    <Text
                      className={
                        form.headerIn.khoMacDinh
                          ? 'text-black text-right'
                          : 'text-gray-400 text-right'
                      }>
                      {form.headerIn.khoMacDinh || 'Chọn kho'}
                    </Text>
                  </Pressable>
                </View>

                {/* Ghi chú */}
                <View className="flex-row py-2">
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
                </View>
              </View>

              {/* Section: Lines Table */}
              <View className="px-1">
                <View className="flex-row justify-between items-center h-10 mb-2">
                  <Text className="text-lg font-bold text-gray-900">
                    Danh sách
                  </Text>
                  <View className="flex-row space-x-2">
                    <Pressable
                      onPress={handleOpenSettingModal}
                      className="bg-primary p-2 rounded-lg">
                      <FontAwesomeIcon icon={faGear} size={15} color="white" />
                    </Pressable>
                    <Pressable
                      onPress={handleModalLine}
                      className="bg-primary p-2 rounded-lg">
                      <FontAwesomeIcon icon={faAdd} size={15} color="white" />
                    </Pressable>
                  </View>
                </View>

                {/* Table Rendering */}
                <View
                  key={`${form?.lines?.length}_${form?.headerIn?.khoMacDinh}_${form?.headerIn?.congDoanTu}_${form?.headerIn?.congDoanDen}`}
                  className="mb-10 rounded-lg overflow-hidden border border-gray-200">
                  <GeneralTable
                    data={(form?.lines || []).filter(
                      line => line.ActionType !== 'DELETE',
                    )}
                    columns={columns}
                    selectedColumns={[
                      'Actions_Left',
                      'STT',
                      ...selectedColumns,
                      'Actions_Right',
                    ]}
                    onRowPress={(item, index) => {
                      handleEdit(item, index);
                    }}
                    renderCell={renderCustomCell}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* {stateModal && (
          <StateModalList
            data={modalStateData}
            handleOpenStateModalList={() => {
              setStateModal(false);
              setActiveField(null);
            }}
            onSubmit={handleGetValueFromStateModal}
            open={stateModal}
            title={
              activeField === 'FROM'
                ? 'Chọn công đoạn từ'
                : 'Chọn công đoạn đến'
            }
          />
        )} */}
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
        {newLineModal && (
          <LineModalInput
            data={line}
            handleOpenLineModal={handleModalLine}
            onSubmit={handleSubmitLine}
            open={newLineModal}
            status={statusModalLine}
            lsx={form.lsx}
            setStatusLine={setStatusModalLine}
            listWarehouses={warehouseList || []}
            listStates={modalStateData || []}
            actionType={statusModalLine}
            // khoTKCat={statusModalLine === 'NEW' ? form.khoTKCat : khoTKCatLine}
            // stateValue={stateValue}
            // machines={machines}
            // maCD={form.maCD}
          />
        )}
        {warehouseModal && (
          <WarehouseModal
            handleOpenWarehouseModal={() => setWarehouseModal(false)}
            open={warehouseModal}
            warehouseList={warehouseList}
            handleGetWarehouse={w => {
              setForm(p => ({
                ...p,
                headerIn: {...p.headerIn, khoMacDinh: w.maKho},
              }));
              setWarehouseModal(false);
            }}
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
          title={'Ngày'}
          onCancel={() => setOpenDate(false)}
        />

        {/* {settingModal && ( <SettingModal handleOpenSettingModal={handleOpenSettingModal} onSubmit={() => { }} open={settingModal} title="Cài đặt hiển thị" selectedColumns={selectedColumns} setSelectedColumns={setSelectedColumns} columns={columns}  /> )}
                {openErrorModal && ( <ErrorModal handleOpenErrorModal={handleOpenErrorModal} open={openErrorModal} title={"Lỗi kết nối máy in"} message={messageError} /> )} */}
        {/* <MachineModal data={machines} handleOpenMachineModal={handleOpenMachineModal} onSubmitMachine={onSubmitMachine} open={machinesModal} title="Danh sách máy" /> */}
        {/* <StaffModal handleGetValue={handleGetNvsxFromModal} handleStaffModal={handleModalNvsx} open={modalNvsx} /> */}
      </View>
    </CameraScannerWrapper>
  );
};

export default InputDetailProduceNavigate;
