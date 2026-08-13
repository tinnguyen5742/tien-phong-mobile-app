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

const OutputDetail3ProduceNavigate = () => {
  // Atom
  const [produceDetailAtom, setProduceDetailAtom] =
    useRecoilState(ProduceDetailAtom);
  const [typeProduceAtom, setTypeProduceAtom] = useRecoilState(ProduceAtomType);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const produceAtom = useRecoilValue(ProduceDetailAtom);
  const produceDetailID = useRecoilValue(ProduceDetailID);
  const [settings, setSettings] = useRecoilState(settingStore);

  const [form, setForm] = useRecoilState(ProduceDetailAtom);
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
  const [fieldFocus, setFieldFocus] = useState('');
  const [reload, setReload] = useState(0);
  const navigate = useNavigation();

  useEffect(() => {
    // 🌟 ĐIỀU KIỆN CHẶN: Chỉ gọi API khi có đầy đủ thông tin để tránh loop vô hạn
    const maTP_BTP = form?.maTP_BTP;
    const congDoan = form?.headerOut?.congDoan;
    const version = form?.headerOut?.version;

    if (form.lsx && maTP_BTP && congDoan && version) {
      console.log('>>> Đủ điều kiện, tiến hành load danh sách máy móc...');
      handleGetMachines(maTP_BTP, version, congDoan);
    } else {
      // Nếu không đủ điều kiện, đảm bảo tắt LoadingAtom đi ngay lập tức
      setLoadingAtom(false);
    }
  }, [
    form.lsx,
    form?.maTP_BTP,
    form?.headerOut?.congDoan,
    form?.headerOut?.version,
  ]);

  const handleBack = () => {
    setProduceDetailAtom(form);
    navigate.goBack();
  };

  const onSubmitMachine = (machine: MachineType) => {
    console.log('selectedMachine: ', machine);
    setMachineValue(machine);
    handleOnChange(machine.maThietBi, 'maMay');
    handleOnChange(machine.tenThietBi, 'tenMay');
    handleOpenMachineModal();
  };

  const handleOnChange = (value: any, field: string) => {
    setForm((prevValues: any) => {
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

  const handleSave = () => {
    console.log(form);
    handleBack();
    // return
  };

  const handleGetMachines = async (
    maVatTu: string,
    version: number,
    congDoan: string,
  ) => {
    try {
      setLoadingAtom(true); // Bật loading an toàn
      const url = `/machines/list?maVatTu=${maVatTu}&version=${version}&congDoan=${congDoan}`;
      console.log('URL gọi danh sách máy:', url);

      const item = await getApi(url, {});
      //   console.log('Kết quả handleGetMachines: ', item);

      if (item && item.length > 0) {
        setMachines(item);
      } else {
        setMachines([]);
        Toast.show({
          type: 'error',
          text1: 'Thông báo',
          text2: 'Danh sách máy móc rỗng',
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách máy:', error);
      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: 'Không tìm thấy danh sách máy!',
      });
    } finally {
      // 🌟 ĐẢM BẢO LUÔN TẮT LOADING kể cả khi API chạy thành công hay thất bại (Lỗi mạng)
      setLoadingAtom(false);
    }
  };

  const handleNvModal = (type: string) => {
    setTypeNV(type);
    handleModalNvsx();
  };

  const handleGetNvsxFromModal = (item: StaffType) => {
    if (typeNV === 'SX') {
      setForm((prevValues: any) => ({
        ...prevValues,
        headerOut: {
          ...prevValues.headerOut,
          tenNVSX: item.tenNV,
          nvSanXuat: item.maNV,
        },
      }));
    } else {
      setForm((prevValues: any) => ({
        ...prevValues,
        headerOut: {
          ...prevValues.headerOut,
          tenNVKiem: item.tenNV,
          nvKiem: item.maNV,
        },
      }));
    }
    setModalNvsx(!modalNvsx);
  };

  const insets = useSafeAreaInsets();
  return (
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
            <TouchableOpacity onPress={() => handleSave()} className="pr-3">
              <FontAwesomeIcon
                icon={faSave}
                size={25}
                color={AppColors.primary}
              />
            </TouchableOpacity>
          </View>
        }
        title="Quay lại"
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
          {/* Section: Thông tin chung */}
          <View className="bg-gray-50 rounded-xl px-2 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-medium w-24">Mã máy</Text>
              <Pressable
                onPress={handleOpenMachineModal}
                className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                <Text className="text-slate-800 text-right" numberOfLines={1}>
                  {form?.headerOut?.maMay || 'Chọn máy'}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-center py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-medium w-24">NVSX</Text>
              <Pressable
                onPress={() => handleNvModal('SX')}
                className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                <Text className="text-slate-800 text-right">
                  {form?.headerOut?.tenNVSX
                    ? form.headerOut.tenNVSX
                    : 'Chọn NV'}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="text-gray-600 font-medium w-24">NV Kiểm</Text>
              <Pressable
                onPress={() => handleNvModal('K')}
                className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                <Text className="text-slate-800 text-right">
                  {form?.headerOut?.tenNVKiem
                    ? form.headerOut.tenNVKiem
                    : 'Chọn NV'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <MachineModal
        data={machines}
        handleOpenMachineModal={handleOpenMachineModal}
        onSubmitMachine={onSubmitMachine}
        open={machinesModal}
        title="Danh sách máy"
      />
      <StaffModal
        handleGetValue={handleGetNvsxFromModal}
        handleStaffModal={handleModalNvsx}
        open={modalNvsx}
      />
    </View>
  );
};

export default OutputDetail3ProduceNavigate;
