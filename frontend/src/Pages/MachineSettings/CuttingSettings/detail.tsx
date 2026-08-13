import {
  faChevronRight,
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
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {useNavigation} from '@react-navigation/native';
import {loadingStore} from '../../../Store/loadingStore';
import {combineDateAndTime, formatDate, formatTime} from '../../../ults';
import {AppColors} from '../../../../colors';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import DatePicker from 'react-native-date-picker';
import {ProductionShiftType, StateType} from './type';
import {settingStore} from '../../../Store/settingStore';
import {
  CuttingDetailAtom,
  CuttingDetailID,
  CuttingStatusTypeAtom,
} from '../store';
import {getApi, postApi} from '../../../Base/api/api_service';
import StateModalList from '../../QualityControl/Modal/StateModal';
import ProductionShiftModal from '../../Produce/Modal/ProductionShiftModal';
import {MachineType} from '../../Produce/type';
import MachineModal from '../../Produce/Modal/MachinesModal';
import {getSettingValue} from '../../Login/store/asyncUserStorage';

const CuttingSettingsDetail = () => {
  const navigate = useNavigation();
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const cuttingDetailID = useRecoilValue(CuttingDetailID);
  const [typeCuttingAtom, setTypeCuttingAtom] = useRecoilState(
    CuttingStatusTypeAtom,
  );
  const [settings, setSettings] = useRecoilState(settingStore);
  const [stateModal, setStateModal] = useState(false);
  const [state, setState] = useState<StateType[]>([]);
  const [productionShiftModal, setProductionShiftModal] = useState(false);
  const [productionShift, setProductionShift] = useState<ProductionShiftType[]>(
    [],
  );
  const [stateValue, setStateValue] = useState<StateType>({
    dienGiai: 'Chọn công đoạn',
  } as StateType);
  const [caSxValue, setProductionShiftValue] = useState<ProductionShiftType>({
    tenDoiTuong: 'Chọn ca',
  } as ProductionShiftType);

  // Khởi tạo State ban đầu
  const [formValues, setFormValues] = useRecoilState(CuttingDetailAtom);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraField, setCameraField] = useState<'lsx' | 'maMay' | null>(null);
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [fieldFocus, setFieldFocus] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<MachineType | null>(
    null,
  );
  const [machines, setMachines] = useState<MachineType[]>([]);
  const [machineValue, setMachineValue] = useState<MachineType>({
    maThietBi: '',
    tenThietBi: 'Vui lòng chọn',
  });
  const [machinesModal, setMachinesModal] = useState(false);

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

  useEffect(() => {
    if (typeCuttingAtom === 'EDIT' && cuttingDetailID) {
      console.log(
        '🚀 Đang ở chế độ EDIT, tiến hành load dữ liệu chi tiết từ Atom CuttingDetailAtom với ID:',
        cuttingDetailID,
      );
      handleGetCuttingDetail(cuttingDetailID);
      // setFormValues({
      //     ...cuttingAtom,
      // } as CuttingFormType);
    }
  }, [typeCuttingAtom, cuttingDetailID]);

  useEffect(() => {
    // Chỉ chạy khi formValues.lsx thực sự có dữ liệu chữ nghĩa đàng hoàng
    if (
      formValues.lsx &&
      formValues.lsx !== 'undefined' &&
      formValues.lsx.trim() !== ''
    ) {
      console.log('🔄 LSX hợp lệ, tiến hành load CaSX, Công đoạn...');
      handleGetVTByLSX(formValues.lsx);
      handleGetProductionShift();
      handleGetState();
    }
  }, [formValues.lsx]);

  useEffect(() => {
    handleGetMachines();
  }, [formValues?.congDoan, formValues?.version]);

  const handleGoToCuttingMachineInfo = () => {
    if (!formValues.lsx || !formValues.maMay) {
      Alert.alert('Thông báo', 'Vui lòng quét LSX và chọn máy');
    } else {
      navigate.navigate('CuttingMachineInfo' as never);
    }
    // navigate.navigate('CuttingMachineInfo' as never);
  };

  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };

  const handleOnChange = (value: any, field: string) => {
    setFormValues((prevValues: any) => {
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
          lsx: value,
        };
      }
      // 3. Nếu là các trường nằm ngoài cùng (Ví dụ: ghiChu)
      return {
        ...prevValues,
        [field]: value,
      };
    });
  };

  const handleClearQrcode = () => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      lsx: '',
    }));
  };

  const handleQRCodeScanned = (scannedQRCode: string) => {
    const scannedQRCodeTrim = scannedQRCode.trim();
    console.log('🔍 Scanned QR Code:', scannedQRCodeTrim);
    // QR code chỉ chứa LSX (không split với #)
    setFormValues(prev => ({
      ...prev,
      lsx: scannedQRCodeTrim,
    }));
  };

  const handleScanResult = async (qrData: string) => {
    const cleanData = qrData ? qrData.trim() : '';
    console.log(
      `🔍 QR Code Data from Camera [Field: ${cameraField}]:`,
      cleanData,
    );

    if (cameraField === 'maMay') {
      setLoadingAtom(true);
      if (
        !formValues?.congDoan ||
        !formValues?.version ||
        !formValues?.maVatTu
      ) {
        setLoadingAtom(false);
        Alert.alert(
          'Thông báo',
          'Không thể xác thực máy do thiếu thông tin Công đoạn, Version hoặc Mã vật tư trên Form!',
          [{text: 'Đồng ý', style: 'default'}],
        );
        return;
      }

      try {
        const url = `/machines/list?maVatTu=${formValues?.maVatTu}&version=${formValues?.version}&congDoan=${formValues?.congDoan}`;
        const validMachines = await getApi(url, {});
        // console.log('📋 Danh sách máy hợp lệ từ API quét:', validMachines);
        const matchedMachine = validMachines?.find(
          (m: any) =>
            m.maThietBi.trim().toUpperCase() === cleanData.toUpperCase(),
        );

        if (matchedMachine) {
          setFormValues(prev => ({
            ...prev,
            maMay: matchedMachine.maThietBi,
            tenThietBi: matchedMachine.tenThietBi,
          }));
          if (typeof setSelectedMachine === 'function') {
            setSelectedMachine(matchedMachine);
          }

          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: `Đã chọn máy: ${matchedMachine.tenThietBi}`,
          });
        } else {
          setFormValues(prev => ({
            ...prev,
            maMay: '',
            tenThietBi: '',
          }));

          Alert.alert(
            'Cảnh báo quét máy',
            `Không tìm thấy mã máy "${cleanData}" phù hợp với công đoạn bạn đang chọn!`,
            [{text: 'Đồng ý', style: 'destructive'}],
          );
        }
      } catch (error) {
        console.error('Lỗi khi check mã máy quét:', error);
        Toast.show({
          type: 'error',
          text1: 'Lỗi hệ thống',
          text2: 'Không thể kết nối danh sách máy lúc này',
        });
      } finally {
        setLoadingAtom(false);
      }
    } else {
      handleQRCodeScanned(cleanData);
    }

    setShowCameraModal(false);
    setCameraField(null);
  };

  const handleStateModal = () => {
    if (!formValues?.lsx) {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    } else {
      setStateModal(!stateModal);
    }
  };

  const handleProductionShiftModal = () => {
    if (!formValues?.lsx) {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    } else {
      setProductionShiftModal(!productionShiftModal);
    }
  };

  const handleOpenMachineModal = () => {
    if (!formValues?.lsx || !formValues?.congDoan) {
      Alert.alert(
        'Thông báo', // Tiêu đề alert
        'Vui lòng chọn Công đoạn trước khi chọn Mã máy!', // Nội dung nhắc nhở
        [{text: 'Đồng ý', style: 'default'}], // Nút bấm đóng alert
      );
    } else {
      setMachinesModal(!machinesModal);
    }
  };

  const handleGetCuttingDetail = async (id: number) => {
    try {
      const url = `/machines/info/cutter/${id}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      console.log('handleGetBlowingDetail: ', item);
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

  const handleGetVTByLSX = async (lsx: string) => {
    try {
      const url = `/mfg/production/orders/${lsx}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      // console.log("handleGetVTByLSX: ", item)
      if (item?.status === true) {
        let _vt = item.data || [];
        setFormValues((prevValues: any) => ({
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
        if (typeCuttingAtom === 'EDIT') {
          const selectedCaSx: any = item.find(
            (value: any) => value.maDoiTuong === formValues.ca,
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
      const url = `/mfg/production/stages/${formValues.lsx}`;
      const item = await getApi(url, {});
      // console.log("handleGetState url: ", url);
      console.log('handleGetState: ', item);

      if (item && item.length > 0) {
        setState(item);
        if (typeCuttingAtom === 'EDIT') {
          const selectedState = item.find(
            (state: StateType) => state.maCD === formValues.congDoan,
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
    if (!formValues?.congDoan || !formValues?.version || !formValues?.maVatTu) {
      setMachines([]);
      setLoadingAtom(false);
      return;
    }
    const url = `/machines/list?maVatTu=${formValues?.maVatTu}&version=${formValues?.version}&congDoan=${formValues?.congDoan}`;
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

  const handleGetValueFromStateModal = (item: StateType) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      MaCD: item.maCD,
      congDoan: item.congDoan.toString(),
      tenCongDoan: item.dienGiai,
      version: item.version,
    }));
    setStateValue(item);
  };

  const handleGetValueFromProductionShiftModal = (
    item: ProductionShiftType,
  ) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      ca: item.maDoiTuong,
      tenCa: item.tenDoiTuong,
    }));
    setProductionShiftValue(item);
  };

  const onSubmitMachine = (machine: MachineType) => {
    console.log('selectedMachine: ', machine);
    setMachineValue(machine);
    handleOnChange(machine.maThietBi, 'maMay');
    handleOnChange(machine.tenThietBi, 'tenThietBi');
    handleOpenMachineModal();
  };

  const handleSave = async (status: string) => {
    if (!formValues.lsx) {
      Toast.show({type: 'error', text1: 'Lỗi', text2: 'Vui lòng quét LSX'});
      return;
    }
    setLoadingAtom(true);

    const submitData = {
      ...formValues,
      id: formValues.id || 0,
      tinhTrang: status,
      detail: formValues.detail || {},
      thoiGian:
        combineDateAndTime(formValues.ngay, formValues.gio).toString() ||
        new Date().toISOString(),
    };
    console.log('submitData: ', submitData);
    console.log(
      'Ngày giờ update: ',
      combineDateAndTime(formValues.ngay, formValues.gio),
    );
    // setLoadingAtom(false);
    // return
    try {
      const url = `/machines/info/cutter/save`;
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

      Toast.show({
        type: 'error',
        text1: 'Đã có lỗi xảy ra vui lòng thử lại!',
        text2:
          err?.message || typeof err === 'string'
            ? err
            : 'Mã phản hồi không hợp lệ hoặc trùng lặp kho',
      });
    } finally {
      setLoadingAtom(false); // Đảm bảo luôn luôn tắt loading dù thành công hay thất bại
    }
  };

  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <View className="flex-1 bg-white">
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
          title="Thông Số Cắt"
        />
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-3">
          {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                        {JSON.stringify(formValues, null, 2)}
                    </Text> */}
          <View className="bg-gray-50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-100">
            {/* Số phiếu */}
            {formValues.soPhieu ? (
              <View className="flex-row justify-between items-center border-b border-gray-200 pt-1 pb-2">
                <Text className="text-gray-600 font-medium">Số phiếu:</Text>
                <Text className="text-gray-900 font-bold">
                  {formValues.soPhieu}
                </Text>
              </View>
            ) : null}
            {/* Ngày & Giờ cài đặt */}
            <View className="flex-row items-center space-x-2 border-b border-gray-200 py-2">
              <Text className="text-gray-600 font-bold w-24">Ngày/Giờ:</Text>
              <Pressable
                onPress={() => setOpenDate(true)}
                className="flex-1 bg-white border border-gray-300 rounded-lg py-3 items-center justify-center">
                <Text className="text-slate-800 font-bold text-md">
                  {formValues?.ngay
                    ? formatDate(new Date(formValues.ngay))
                    : formatDate(new Date())}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setOpenTime(true)}
                className="flex-1 bg-white border border-gray-300 rounded-lg py-3 items-center justify-center">
                <Text className="text-slate-800 font-bold text-md">
                  {formValues?.gio
                    ? formValues.gio
                    : formatTime(new Date(), false)}
                </Text>
              </Pressable>
            </View>
            {/* QRCode LSX */}
            <View className="flex-row items-center justify-between border-b border-gray-200 py-2">
              <Text className="text-gray-600 font-medium w-24">
                QRCode LSX:
              </Text>
              <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                <TextInput
                  className="flex-1 h-full text-slate-800 focus:border-blue-500"
                  onChangeText={text => handleOnChange(text, 'qrCode')}
                  onFocus={() => handleFocus('qrCode')}
                  value={formValues.lsx}
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
            {/* Mã BTP/TP (Chỉ đọc từ LSX) */}
            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <Text className="text-gray-600 font-medium w-24">Mã TP/BTP:</Text>
              <Text className="text-gray-800 font-bold mr-2">
                {formValues.maVatTu || ''}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-medium w-24">
                Tên TP/BTP:
              </Text>
              <Text className="text-gray-800 font-bold mr-2 flex-1 text-right">
                {formValues.tenVatTu || ''}
              </Text>
            </View>
            {/* Ca */}
            <View className="flex-row items-center justify-between border-b border-gray-200 py-2">
              <Text className="text-gray-600 font-medium w-24">Ca SX</Text>
              <Pressable
                className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                onPress={handleProductionShiftModal}>
                <Text className="text-gray-800 text-right">
                  {formValues?.tenCa ? formValues?.tenCa : 'Chọn ca'}
                </Text>
              </Pressable>
            </View>
            {/* Công đoạn Select */}
            <View className="flex-row items-center border-b border-gray-200 py-2">
              <Text className="text-gray-600 font-medium w-24">Công đoạn</Text>
              <Pressable
                className="flex-1 bg-white border border-gray-300 rounded-lg h-11 justify-center px-3"
                onPress={handleStateModal}>
                <Text className="text-gray-800 text-right">
                  {formValues?.tenCongDoan
                    ? formValues?.tenCongDoan
                    : stateValue
                    ? stateValue.dienGiai
                    : 'Chọn công đoạn'}
                </Text>
              </Pressable>
            </View>
            {/* QRCode Mã máy / Tên máy */}
            <View className="flex-row items-center py-2">
              <Text className="text-gray-600 font-medium w-24">Mã máy:</Text>
              <View className="flex-1 flex-row items-center bg-white border border-gray-300 rounded-lg px-2 h-11">
                <Pressable
                  className="flex-1 justify-center"
                  onPress={handleOpenMachineModal}>
                  <Text
                    className={
                      formValues.tenThietBi ? 'text-gray-900' : 'text-gray-400'
                    }>
                    {formValues.tenThietBi
                      ? formValues.tenThietBi
                      : 'Chọn hoặc quét máy'}
                  </Text>
                </Pressable>
                <View className="flex-row">
                  {settings.useCameraScan && (
                    <Pressable
                      className="p-2"
                      onPress={() => {
                        if (!formValues?.lsx || !formValues?.congDoan) {
                          Alert.alert(
                            'Thông báo',
                            'Vui lòng chọn Công đoạn trước khi chọn Mã máy!',
                            [{text: 'Đồng ý', style: 'default'}],
                          );
                          return;
                        }
                        setCameraField('maMay');
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
                      setFormValues(p => ({...p, maMay: '', tenThietBi: ''}));
                      setSelectedMachine(null);
                    }}>
                    <FontAwesomeIcon icon={faXmark} size={18} color="#9ca3af" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
          <Pressable
            onPress={handleGoToCuttingMachineInfo}
            className="flex-row justify-center items-center bg-primary py-3 px-2 rounded-lg">
            <Text className="text-white text-center mr-3">
              Thông số vận hành cắt{' '}
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
      {/* HỆ THỐNG DATE/TIME PICKER ĐỒNG BỘ CỦA FILE GỐC */}
      <DatePicker
        modal
        mode="date"
        open={openDate}
        date={
          formValues?.ngay && !isNaN(Date.parse(formValues.ngay))
            ? new Date(formValues.ngay)
            : new Date()
        }
        locale="vi"
        onConfirm={date => {
          setOpenDate(false);
          setFormValues(prev => ({...prev, ngay: date.toISOString()}));
        }}
        onCancel={() => setOpenDate(false)}
        title="Chọn ngày lập phiếu"
      />
      <DatePicker
        modal
        mode="time"
        open={openTime}
        date={
          formValues?.gio && !isNaN(Date.parse(formValues.gio))
            ? new Date(formValues.gio)
            : new Date()
        }
        locale="vi"
        onConfirm={time => {
          setOpenTime(false);
          setFormValues(prev => ({
            ...prev,
            gio: formatTime(time.toISOString()),
          }));
        }}
        onCancel={() => setOpenTime(false)}
        title="Chọn giờ lập phiếu"
      />
      <MachineModal
        data={machines}
        handleOpenMachineModal={handleOpenMachineModal}
        onSubmitMachine={onSubmitMachine}
        open={machinesModal}
        title="Danh sách máy"
      />
    </CameraScannerWrapper>
  );
};

export default CuttingSettingsDetail;
