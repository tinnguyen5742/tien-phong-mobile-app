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

const OutputDetail2ProduceNavigate = () => {
  // Atom
  const [produceDetailAtom, setProduceDetailAtom] =
    useRecoilState(ProduceDetailAtom);
  const [typeProduceAtom, setTypeProduceAtom] = useRecoilState(ProduceAtomType);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const produceAtom = useRecoilValue(ProduceDetailAtom);
  const produceDetailID = useRecoilValue(ProduceDetailID);
  const [fieldFocus, setFieldFocus] = useState('');
  const [settings, setSettings] = useRecoilState(settingStore);
  const [reload, setReload] = useState(0);
  const navigate = useNavigation();
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [listMaterial, setListMaterial] = useState([]);
  const [materialModal, setMaterialModal] = useState(false);
  const [materialValue, setMaterialValue] = useState<MaterialType>({
    tenVatTu: 'Chọn TP/BTP',
  } as MaterialType);
  const [form, setForm] = useRecoilState(ProduceDetailAtom);

  useEffect(() => {
    console.log('produceAtom: ', produceAtom);
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

  useEffect(() => {
    handleGetVTByLSX(form.lsx);
  }, []);

  // Cờ hiệu đánh dấu xem người dùng đã chạm tay vào chỉnh sửa số hay chưa
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  useEffect(() => {
    // 1. Nếu là màn hình tạo mới (NEW), luôn luôn cho phép tự động tính toán
    // 2. Nếu là màn hình EDIT, CHỈ tính toán khi cờ isUserInteracted đã bật (User thực sự gõ phím sửa số)
    if (typeProduceAtom === 'NEW' || isUserInteracted) {
      const slmd = Number(form?.headerOut?.slmd || 0);
      const khoTKCat = Number(form?.headerOut?.khoTKCat || 0);
      const calculatedSlgd = (slmd * khoTKCat) / 1000;

      // Lấy giá trị hiện tại trong form để so sánh tránh loop vô hạn
      const existingSlgd = Number(form?.headerOut?.slgd || 0);

      if (calculatedSlgd !== existingSlgd && calculatedSlgd > 0) {
        setForm((prev: any) => ({
          ...prev,
          headerOut: {
            ...(prev?.headerOut || {}),
            slgd: calculatedSlgd,
          },
        }));
      }
    }
  }, [
    form?.headerOut?.slmd,
    form?.headerOut?.khoTKCat,
    isUserInteracted,
    typeProduceAtom,
  ]);

  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };

  const handleOnChange = (value: any, field: string) => {
    setForm((prevValues: any) => {
      const headerFields = [
        'sldvtGoc',
        'khoTKCat',
        'slNet',
        'slGross',
        'slmd',
        'slgd',
        'slM2',
        'tenCongDoan',
        'maMay',
        'nvSanXuat',
        'nvKiem',
      ];

      if (headerFields.includes(field)) {
        if (field === 'slmd' || field === 'khoTKCat') {
          setIsUserInteracted(true);
        }
        return {
          ...prevValues,
          headerOut: {
            ...(prevValues?.headerOut || {}),
            [field]: value,
          },
        };
      }
      return {
        ...prevValues,
        [field]: value,
      };
    });
  };

  const handleBack = () => {
    setTypeProduceAtom('NEW');
    navigate.goBack();
  };

  const handleMaterialModal = () => {
    if (form.lsx !== '') {
      setMaterialModal(!materialModal);
    } else {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    }
  };

  const handleOpenErrorModal = () => setOpenErrorModal(!openErrorModal);

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

  const handleGetVTByLSX = async (lsx: string) => {
    try {
      const url = `/mfg/production/orders/out/${lsx}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      //   console.log('handleGetVTByLSX: ', `length: ${item.data.length}`, item);
      if (item?.status === true) {
        const _vt = item.data || [];
        if (_vt.length === 1) {
          console.log(_vt[0]);
          setForm((prevValues: any) => ({
            ...prevValues,
            maVatTu: _vt[0].maVatTu,
            tenVatTu: _vt[0].tenVatTu,
            headerOut: {
              ...prevValues.headerOut,
              dvtGoc: _vt[0].dvt,
            },
          }));
        } else {
          setListMaterial(_vt);
          console.log(listMaterial);
        }
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

  const handleSave = () => {
    console.log(form);
    handleBack();
    // return
  };

  const handleGoToMachineStaff = () => {
    if (!form?.lsx || !form?.headerOut?.congDoan || !form?.caSX) {
      Alert.alert('Thông báo', 'Vui lòng chọn đủ thông tin để tiếp tục');
    } else {
      navigate.navigate('OutputDetail3Produce' as never);
    }
    // navigate.navigate('BagMakingMachineInfo' as never);
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
            {listMaterial?.length > 1 ? (
              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Chọn TP/BTP:
                </Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-2 py-1 h-14 justify-center px-3"
                  onPress={handleMaterialModal}>
                  <Text className="text-gray-800 text-right">
                    {form?.tenVatTu ? form?.tenVatTu : 'Chọn TP/BTP'}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View className="flex-row justify-between items-center border-b border-gray-200 py-4">
              <Text className="text-gray-600 font-medium w-24">Mã TP/BTP:</Text>
              <Text className="text-gray-800 font-bold mr-2">
                {form.maVatTu || ''}
              </Text>
            </View>

            <View className="flex-row justify-between items-center border-b border-gray-200 py-4">
              <Text className="text-gray-600 font-medium w-24">
                Tên TP/BTP:
              </Text>
              <Text className="text-gray-800 font-bold mr-2 text-right flex-1">
                {form.tenVatTu || ''}
              </Text>
            </View>

            <View className="flex-row justify-between items-center border-b border-gray-200 py-4">
              <Text className="text-gray-600 font-medium w-24">ĐVT Gốc:</Text>
              <Text className="text-gray-800 font-bold mr-2">
                {form?.headerOut?.dvtGoc || ''}
              </Text>
            </View>

            {/* Khổ TK/Cắt */}
            <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-medium w-24">
                Khổ TK/Cắt:
              </Text>
              <TextInput
                className="flex-1 text-right bg-white border border-gray-300 rounded-lg h-11 px-3 text-gray-600"
                onFocus={() => handleFocus('khoTKCat')}
                onChangeText={text => handleOnChange(text, 'khoTKCat')}
                keyboardType="numeric"
                value={form?.headerOut?.khoTKCat ? form.headerOut.khoTKCat : ''}
              />
            </View>

            <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-medium w-24">SL MD</Text>
              <TextInput
                className="flex-1 text-right bg-white border border-gray-300 rounded-lg h-11 px-3 text-gray-600"
                onFocus={() => handleFocus('slmd')}
                onChangeText={text => handleOnChange(text, 'slmd')}
                keyboardType="numeric"
                value={
                  form?.headerOut?.slmd !== undefined &&
                  form?.headerOut?.slmd !== null
                    ? String(form.headerOut.slmd)
                    : ''
                }
              />
            </View>

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-600 font-medium w-24">SL GD</Text>
              <TextInput
                className="flex-1 text-right bg-white border border-gray-300 rounded-lg h-11 px-3 text-gray-600"
                onFocus={() => handleFocus('slgd')}
                onChangeText={text => handleOnChange(text, 'slgd')}
                keyboardType="numeric"
                value={
                  form?.headerOut?.slgd !== undefined &&
                  form?.headerOut?.slgd !== null
                    ? String(form.headerOut.slgd)
                    : ''
                }
              />
            </View>
          </View>
          <Pressable
            onPress={handleGoToMachineStaff}
            className="flex-row justify-center items-center bg-primary py-3 px-2 rounded-lg">
            <Text className="text-white text-center mr-3">
              Chọn mã máy, nhân viên
            </Text>
            <FontAwesomeIcon icon={faChevronRight} size={16} color="white" />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals & Pickers */}
      {materialModal && (
        <MaterialModalList
          data={listMaterial}
          handleOpenMaterialModalList={handleMaterialModal}
          onSubmit={handleGetValueFromMaterialModal}
          open={materialModal}
          title="Chọn TP/BTP"
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
    </View>
  );
};

export default OutputDetail2ProduceNavigate;
