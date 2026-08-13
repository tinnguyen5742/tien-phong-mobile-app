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
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {useNavigation} from '@react-navigation/native';
import {loadingStore} from '../../Store/loadingStore';
import CameraScannerWrapper from '../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {settingStore} from '../../Store/settingStore';
import {getSettingValue} from '../Login/store/asyncUserStorage';
import {userAtom} from '../Login/store/userAtom';
import {LocatorType, WarehouseType} from '../WareHouse/type';
import {get_cus, post_cus} from '../../Base/api/api_service';
import {NhapCuonlStyle} from './style';
import {CustomColor, device} from '../../ults';
import {LineFormNhapCuon, TypeFormNhapCuon} from './Type/NhapCuonType';
import WarehouseModal from '../WareHouse/Modal/WarehouseModal';
import {NhapCuonLineAtom, NhapCuonStatusTypeAtom} from './store/NhapCuonStore';
import {AppColors} from '../../../colors';
const NhapCuon = () => {
  const navigate = useNavigation();
  //! recoil

  const userStore = useRecoilValue(userAtom);
  // const setLineLotIndexAtom = useSetRecoilState(getLineLotIndexStore);
  const statusTypeValueNhapCuon = useRecoilValue(NhapCuonStatusTypeAtom);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const [settings, setSettings] = useRecoilState(settingStore);
  const detailNhapCuonValue = useRecoilValue(NhapCuonLineAtom);
  const today = new Date();
  //! useState
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'Mã vật tư',
    'Số lô',
    'Vị trí xuất',
    'Số lượng',
    'Tên vật tư',
    'DVT',
    'Kho xuất',
    'Kho nhập',
    'Ghi chú',
  ]); // Default selected columns
  const [fieldFocus, setFieldFocus] = useState('');
  const [showSaveLocator, setShowSaveLocator] = useState(false);
  const [completeDisable, setCompleteDisable] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraField, setCameraField] = useState<string>('');
  const [settingModal, setSettingModal] = useState(false);
  const [formValues, setFormValues] = useState<TypeFormNhapCuon>({
    maCuonNhap: '',
    maKho: '',
    maViTriNhap: '',
    ngayTao: today,
    lines: [],
  });
  const [warehouseList, setWarehouseList] = useState<WarehouseType[]>([]);
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [warehouseValue, setWarehouseValue] = useState<WarehouseType>({
    maKho: '',
    tenKho: '',
    createdBy: '',
    createdDate: '',
    dangSuDung: '',
    diaChi: '',
    dienGiai: '',
    dienThoai: '',
    dienTich: '',
    dmKho_F1: '',
    dmKho_F2: '',
    dmKho_F3: '',
    dmKho_F4: '',
    dmKho_F5: '',
    modifiedBy: '',
    modifiedDate: '',
    dungLocator: '',
    khoID: '',
    khoKhongGia: '',
    loaiCTN: '',
    loaiCTX: '',
    loaiKho: '',
    maDonVi: '',
    maKhuVuc: '',
    taiKhoanKho: '',
    taiKhoanGV: '',
  });
  const [locatorList, setLocatorList] = useState<LocatorType[]>([]);
  const [locatorValue, setLocatorValue] = useState<LocatorType>({
    active: '',
    chieuCao: 0,
    defaultPO: '',
    dienTich: 0,
    maKho: '',
    maLocator: '',
    tenLocator: '',
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [noteLine, setNoteLine] = useState('');
  const [disableLocator, setDisableLocaltor] = useState(false);
  const [Slxuat, setSlxuat] = useState(0);
  const scrollRef: any = useRef(null);
  const columns = [
    {name: 'Mã vật tư', label: 'Mã vật tư'},
    {name: 'Số lô', label: 'Số lô'},
    {name: 'Vị trí xuất', label: 'Vị trí xuất'},
    {name: 'Số lượng', label: 'Số lượng'},
    {name: 'Tên vật tư', label: 'Tên vật tư'},
    {name: 'DVT', label: 'DVT'},
    {name: 'Kho xuất', label: 'Kho xuất'},
    {name: 'Kho nhập', label: 'Kho nhập'},
    {name: 'Ghi chú', label: 'Ghi chú'},
  ];
  const convertDate = (date: any) => {
    let today: any;
    if (date) {
      today = new Date(date);
    } else {
      today = new Date();
    }
    return (
      today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear()
    );
  };
  const handleBack = () => {
    // setLineIndexItem(-1);
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

  const handleSaveForm = async () => {
    // console.log('warehouseValue.maKho: ', warehouseValue.maKho);
    const formSubmit = {
      ...formValues,
      maKho: warehouseValue.maKho,
    };

    console.log('formSubmit: ', formSubmit);
    if (
      formSubmit.maKho === '' ||
      formSubmit.maCuonNhap === '' ||
      formSubmit.maViTriNhap === '' ||
      formSubmit.lines.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Kiểm tra lại thông tin trên header',
      });
    } else {
      setLoadingAtom(true);
      post_cus(
        statusTypeValueNhapCuon === 'EDIT'
          ? `/NhapCuon/update`
          : `/NhapCuon/create`,
        formSubmit,
        (err: any, resp: any) => {
          if (!err) {
            console.log('resp: ', resp);
            Toast.show({
              type: 'success',
              text1: 'Thành công',
              text2: resp.Message,
            });

            setWarehouseValue({} as WarehouseType);
            setLoadingAtom(false);
            navigate.goBack();
          } else {
            console.log('err: ', err);
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: err,
            });
            setLoadingAtom(false);
          }
        },
      );
    }
  };
  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };
  const handleQRCodeScanned = (scannedQRCode: string, fieldFocus: string) => {
    const scannedQRCodeTrim = scannedQRCode.trim(); // Trim để loại bỏ khoảng trắng thừa nếu có
    // console.log('Trimmed Scanned QR Code:', scannedQRCodeTrim);

    if (scannedQRCodeTrim.includes('#')) {
      const [MaBTP_Tp, soLo] = scannedQRCodeTrim.split('#');

      // Kiểm tra xem mã QR code đã tồn tại trong danh sách Lines chưa
      const existingLine = formValues.lines.some(
        line => line.maQR === scannedQRCodeTrim,
      );
      setFormValues(prevValues => ({
        ...prevValues,
        maCuonNhap: soLo,
      }));
      if (existingLine) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'QR code đã được quét.',
        });
      } else {
        // Gọi API để lấy thông tin kho dựa trên mã vật tư và số lô
        const paramItem = {
          maBTP_Tp: MaBTP_Tp,
          soLo: soLo,
        };

        handleGetItem(paramItem, scannedQRCodeTrim);
      }
    } else if (fieldFocus === 'ViTriNhap') {
      // Xử lý khi quét QR cho vị trí nhập
      // console.log('locatorList: ', locatorList);
      const locationFilter = locatorList.find(
        (locator: LocatorType) => locator.maLocator === scannedQRCode,
      );
      // console.log('locationFilter: ', locationFilter);
      if (locationFilter) {
        const updatedLines = formValues.lines.map((line: LineFormNhapCuon) => ({
          ...line,
          maViTri: locationFilter.maLocator, // Cập nhật vị trí cho tất cả dòng
        }));
        setFormValues(prevValues => ({
          ...prevValues,
          maViTriNhap: locationFilter.maLocator,
          lines: updatedLines,
        }));
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Mã vị trí đã được gán.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: `Không tìm thấy vị trí ${scannedQRCode} trong kho`,
        });
      }
    }
  };

  useEffect(() => {
    if (statusTypeValueNhapCuon === 'EDIT') {
      const cloneFormValues = {...detailNhapCuonValue, maCuonNhap: ''};
      setFormValues(cloneFormValues);
      handleGetListWarehouse(detailNhapCuonValue.maKho); // show warehouse value when edit
    }
    handleGetListWarehouse();
    handleGetListLocator();
  }, []);
  useEffect(() => {
    console.log('formValues.lines: ', formValues.lines);
    const checkLine = formValues.lines.some((line: any) => {
      console.log('line.id: ', line.id);
      // Kiểm tra nếu có dòng nào có id là undefined hoặc null
      return line.id == undefined || line.id == null;
    });

    // Nếu không có dòng nào có id là null hoặc undefined, set showLocator thành true
    if (!checkLine && formValues.lines.length !== 0) {
      setShowSaveLocator(true);
    } else {
      setShowSaveLocator(false); // Cập nhật lại để tránh lỗi
    }
  }, [formValues]);

  const handleGetItem = async (param: any, MaQR: string) => {
    setLoadingAtom(true);
    // console.log('param nhap xuat: ', param);
    try {
      // Gọi API bằng phương thức GET với các tham số
      const item = await get_cus(
        `/NhapCuon/get-macuon-info?maBTP_Tp=${param.maBTP_Tp}&soLo=${param.soLo}`,
        {},
      );

      // Kiểm tra và xử lý dữ liệu trả về
      if (item && item.data) {
        const lineScan = item.data; // Lấy mảng dữ liệu mới từ API

        // Thêm mã cuộn và mã QR vào từng dòng và định dạng lại
        const formatLine = lineScan.map((line: any) => {
          console.log('line: ', line);
          return {
            maCuon: line.Macuon, // Gán mã cuộn từ API vào thuộc tính MaCuon
            maQR: MaQR, // Gán mã QR đã quét vào dòng
            maViTri: '', // Để trống vị trí nhập ban đầu
            ten: line.Ten, // Gán tên từ API vào thuộc tính Ten
            ma: line.Ma,
          };
        });
        console.log('formatLine: ', formatLine);
        // Cập nhật lại formValues với dòng mới
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          lines: [...prevFormValues.lines, ...formatLine], // Thêm dòng mới vào danh sách Lines
        }));

        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Dữ liệu đã được thêm vào Lines.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không có dữ liệu từ API.',
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy dữ liệu',
      });
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleGetListWarehouse = async (maKho?: string) => {
    setLoadingAtom(true);
    try {
      const item = await get_cus(`/warehouse/getList`, {});
      if (item) {
        // console.log('item: ', item);
        const dataWarehouse = item.data;
        setWarehouseList(dataWarehouse);
        if (maKho) {
          const warehouseFilter = dataWarehouse.find(
            (warehouse: WarehouseType) => warehouse.maKho === maKho,
          );
          setWarehouseValue(warehouseFilter);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy sản phẩm',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingAtom(false);
    }
  };
  const handleGetListLocator = async () => {
    setLoadingAtom(true);
    try {
      const item = await get_cus(`/locator/getList`, {});
      if (item) {
        // console.log('list locator: ', item);
        setLocatorList(item.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy sản phẩm',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingAtom(false);
    }
  };
  // const handleQrcodeChange = (value: string) => {
  //     handleQRCodeScanned(value, fieldFocus);
  // }
  const handleChangeInput = (value: any, field: string) => {
    // Khi user nhập manual (không phải từ camera)
    if (field === 'MaCuonNhap') {
      // Nếu có '#' thì xử lý như QR code
      if (value.includes('#')) {
        handleQRCodeScanned(value, field);
      }
      // Nếu không có '#' thì user đang gõ manual - không xử lý
    } else if (field === 'MaViTriNhap') {
      // Nếu camera mode OFF, xử lý manual input
      if (!settings.useCameraScan) {
        handleGetLocator(value);
      }
    }
  };

  const handleScrollToItem = (lineIndexItem: any) => {
    if (scrollRef.current && lineIndexItem >= 0) {
      // Di chuyển đến vị trí của mục trong `ScrollView`
      scrollRef.current.scrollTo({x: 0, y: lineIndexItem * 40, animated: true});
    }
  };

  const generalTable = (data: any) => {
    let rows: any = [];
    if (data) {
      data.map((value: LineFormNhapCuon, key: number) => {
        // console.log("🚀 ~ file: index.js:71 ~ data.map ~ value:", value);
        rows.push(
          <View key={key} style={{...NhapCuonlStyle.rowTable}}>
            <View style={{...NhapCuonlStyle.headerCell, width: 50}}>
              <Text>{key + 1}</Text>
            </View>
            <View style={{...NhapCuonlStyle.headerCell, width: 160}}>
              <Text>{value.maCuon}</Text>
            </View>
            <View style={{...NhapCuonlStyle.headerCell, width: 100}}>
              <Text>{value.ma}</Text>
            </View>
            <View style={{...NhapCuonlStyle.headerCell, width: 200}}>
              <Text>{value.ten}</Text>
            </View>
            <View style={{...NhapCuonlStyle.headerCell, width: 120}}>
              <Text>{value.maViTri}</Text>
            </View>
            <View style={{...NhapCuonlStyle.headerCell, width: 200}}>
              <Text>{value.maQR}</Text>
            </View>

            <View style={{...NhapCuonlStyle.headerCell, width: 55}}>
              <Pressable
                onPress={() => handleDeleteItem(key)}
                disabled={completeDisable}>
                <FontAwesomeIcon
                  icon={faTrash}
                  size={15}
                  color={AppColors.primary}
                />
              </Pressable>
            </View>
          </View>,
        );
      });
    }
    return (
      <View style={NhapCuonlStyle.table}>
        <ScrollView horizontal={true}>
          <View style={{flexDirection: 'column'}}>
            <View style={NhapCuonlStyle.headerTable}>
              <View style={{...NhapCuonlStyle.headerCell, width: 50}}>
                <Text>STT</Text>
              </View>
              <View style={{...NhapCuonlStyle.headerCell, width: 160}}>
                <Text>Mã cuộn</Text>
              </View>
              <View style={{...NhapCuonlStyle.headerCell, width: 100}}>
                <Text>Mã</Text>
              </View>
              <View style={{...NhapCuonlStyle.headerCell, width: 200}}>
                <Text>Tên</Text>
              </View>
              <View style={{...NhapCuonlStyle.headerCell, width: 120}}>
                <Text>Mã vị trí</Text>
              </View>
              <View style={{...NhapCuonlStyle.headerCell, width: 200}}>
                <Text>Mã QR</Text>
              </View>

              <View style={{...NhapCuonlStyle.headerCell, width: 50}}>
                <Pressable>
                  <FontAwesomeIcon
                    icon={faTrash}
                    size={15}
                    color={AppColors.primary}
                  />
                </Pressable>
              </View>
            </View>
            <ScrollView
              style={{
                flexDirection: 'column',
                height: formValues.lines.length * 75,
              }}>
              {rows}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  const handleDeleteItem = (index: number) => {
    // Xóa dòng tại chỉ mục `index` khỏi `formValues.Lines`
    console.log('index: ', index);
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      lines: prevFormValues.lines.filter((_, i) => i !== index),
    }));
  };

  const handleOpenWarehouseModal = () => {
    setWarehouseModal(!warehouseModal);
  };

  const handleGetWarehouse = (warehouse: WarehouseType) => {
    setWarehouseValue(warehouse);
  };
  const handleClearLocator = () => {
    setFormValues((prevValues: TypeFormNhapCuon) => ({
      ...prevValues,
      maViTriNhap: '',
    }));
  };
  const HandleSaveLocator = () => {
    post_cus(
      `/NhapCuon/update_ma_locator?soCT=${formValues.soCT}`,
      {},
      (err: any, resp: any) => {
        if (!err) {
          console.log('resp: ', resp);
          if (resp.status) {
            Toast.show({
              type: 'success',
              text1: 'Lưu thành công',
              text2: resp.message,
            });
          } else {
            Toast.show({
              type: 'error',
              text1: 'Lưu thất bại',
              text2: resp.message,
            });
          }
          setLoadingAtom(false);
          // navigate.goBack();
        } else {
          console.log('err: ', err);
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: err,
          });
          setLoadingAtom(false);
        }
      },
    );
  };
  const handleGetLocator = (locator: string) => {
    const locatorFound = locatorList.find(
      (l: LocatorType) => l.maLocator === locator,
    );
    // Tìm dòng trong Lines chưa có mã vị trí nhưng đã có mã cuộn
    if (locatorFound) {
      // setLocatorValue(locatorFound);
      const updatedLines = formValues.lines.map((line: LineFormNhapCuon) => {
        // if (!line.maViTri && line.maCuon) {
        return {
          ...line,
          maViTri: locatorFound.maLocator, // Gán mã vị trí mới cho dòng
        };
        // }
        // return line;
      });

      setFormValues((prevValues: TypeFormNhapCuon) => ({
        ...prevValues,
        maViTriNhap: locatorFound.maLocator,
        lines: updatedLines, // Cập nhật danh sách Lines
      }));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Mã vị trí đã được gán cho cuộn.',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy vị trí.',
      });
    }
  };

  const handleClearMaCuon = () => {
    setFormValues((prevValues: TypeFormNhapCuon) => ({
      ...prevValues,
      maCuonNhap: '',
    }));
  };

  const handleScanResult = (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData, 'Field:', cameraField);
    if (cameraField === 'MaCuonNhap') {
      handleQRCodeScanned(qrData, 'MaCuonNhap');
    } else if (cameraField === 'ViTriNhap') {
      handleQRCodeScanned(qrData, 'ViTriNhap');
    }
    setShowCameraModal(false);
    setCameraField('');
  };
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <View style={NhapCuonlStyle.inventory}>
        <HeaderComponent
          backButton={true}
          handleBack={handleBack}
          iconRight={
            <TouchableOpacity onPress={handleSaveForm}>
              <FontAwesomeIcon
                icon={faSave}
                size={25}
                color={AppColors.primary}
              />
            </TouchableOpacity>
          }
          title={statusTypeValueNhapCuon === 'EDIT' ? 'Chi tiết' : 'Nhập cuộn'}
          // handleRightIconButton={handleRightIconButton}
        />
        <View>
          <ScrollView>
            <View style={NhapCuonlStyle.header}>
              <View style={NhapCuonlStyle.headerLine}>
                <View style={NhapCuonlStyle.groupHeaderItem}>
                  <View
                    style={{
                      ...NhapCuonlStyle.headerRef,
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        ...NhapCuonlStyle.headerText,
                        fontWeight: 'bold',
                      }}>
                      Thời gian:{' '}
                    </Text>
                    <Text
                      style={{
                        ...NhapCuonlStyle.headerText,
                        color: AppColors.primary,
                      }}>
                      {convertDate(
                        statusTypeValueNhapCuon === 'EDIT'
                          ? formValues.ngayTao
                          : today,
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {statusTypeValueNhapCuon === 'EDIT' && (
              <View style={NhapCuonlStyle.header}>
                <View style={NhapCuonlStyle.headerLine}>
                  <View style={NhapCuonlStyle.groupHeaderItem}>
                    <View
                      style={{
                        ...NhapCuonlStyle.headerRef,
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          ...NhapCuonlStyle.headerText,
                          fontWeight: 'bold',
                        }}>
                        Số CT:{' '}
                      </Text>
                      <Text style={{...NhapCuonlStyle.headerText}}>
                        {formValues.soCT}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            <View style={NhapCuonlStyle.headerLine}>
              <View style={NhapCuonlStyle.groupHeaderItem}>
                <View
                  style={{
                    ...NhapCuonlStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  {/* <View style={{ ...NhapCuonlStyle.warehouseView }}> */}
                  <Text
                    style={{
                      ...NhapCuonlStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    Mã kho:{' '}
                  </Text>

                  <Pressable
                    disabled={completeDisable}
                    onPress={() => handleOpenWarehouseModal()}
                    style={{
                      ...NhapCuonlStyle.warehousePressible,
                      borderColor: CustomColor.colorList.grey,
                    }}>
                    <Text>
                      {(warehouseValue && warehouseValue.tenKho) !== ''
                        ? warehouseValue.tenKho
                        : 'Chọn kho'}
                    </Text>
                  </Pressable>
                  {/* </View> */}
                </View>
              </View>
            </View>

            <View style={NhapCuonlStyle.headerLine}>
              <View style={NhapCuonlStyle.groupHeaderItem}>
                <View
                  style={{
                    ...NhapCuonlStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...NhapCuonlStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    Mã cuộn nhập:{' '}
                  </Text>
                  <View style={NhapCuonlStyle.textInputWithButton}>
                    <TextInput
                      editable={!disableLocator}
                      onChangeText={text =>
                        handleChangeInput(text, 'MaCuonNhap')
                      }
                      value={formValues.maCuonNhap}
                      onFocus={() => handleFocus('MaCuonNhap')}
                      placeholder="Mã cuộn nhập"
                    />
                    <View style={{flexDirection: 'row'}}>
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('MaCuonNhap');
                            setShowCameraModal(true);
                          }}
                          style={NhapCuonlStyle.iconPressable}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleClearMaCuon}
                        style={NhapCuonlStyle.iconPressable}>
                        <FontAwesomeIcon
                          icon={faXmark}
                          size={18}
                          color={CustomColor.colorList.grey}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={NhapCuonlStyle.headerLine}>
              <View style={NhapCuonlStyle.groupHeaderItem}>
                <View
                  style={{
                    ...NhapCuonlStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...NhapCuonlStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    Mã vị trí nhập:{' '}
                  </Text>
                  <View style={NhapCuonlStyle.textInputWithButton}>
                    <TextInput
                      editable={!disableLocator}
                      onChangeText={text =>
                        handleChangeInput(text, 'MaViTriNhap')
                      }
                      value={formValues.maViTriNhap}
                      onFocus={() => handleFocus('ViTriNhap')}
                      placeholder="Vị trí nhập"
                    />
                    <View style={{flexDirection: 'row'}}>
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('ViTriNhap');
                            setShowCameraModal(true);
                          }}
                          style={NhapCuonlStyle.iconPressable}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleClearLocator}
                        style={NhapCuonlStyle.iconPressable}>
                        <FontAwesomeIcon
                          icon={faXmark}
                          size={18}
                          color={CustomColor.colorList.grey}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={{width: '100%', alignItems: 'flex-end'}}>
              {showSaveLocator && (
                <Pressable
                  style={{
                    backgroundColor: AppColors.primary,
                    margin: 10,
                    padding: 10,
                    borderRadius: 20,
                  }}
                  onPress={() => HandleSaveLocator()}>
                  <Text style={{color: CustomColor.colorList.shadowWhite}}>
                    Lưu locator
                  </Text>
                </Pressable>
              )}
            </View>
            <View>{generalTable(formValues?.lines)}</View>
          </ScrollView>
        </View>

        {warehouseModal && (
          <WarehouseModal
            handleOpenWarehouseModal={() => setWarehouseModal(!warehouseModal)}
            open={warehouseModal}
            warehouseList={warehouseList}
            handleGetWarehouse={handleGetWarehouse}
          />
        )}
      </View>
    </CameraScannerWrapper>
  );
};
export default NhapCuon;
