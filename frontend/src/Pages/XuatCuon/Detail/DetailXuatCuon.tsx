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
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {settingStore} from '../../../Store/settingStore';
import {getSettingValue} from '../../Login/store/asyncUserStorage';
import {useNavigation} from '@react-navigation/native';
import {userAtom} from '../../Login/store/userAtom';
import {
  NhapCuonLineAtom,
  NhapCuonStatusTypeAtom,
} from '../../NhapCuon/store/NhapCuonStore';
import {loadingStore} from '../../../Store/loadingStore';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {DetailXuatCuonStyle} from './DetailXuatCuonStyles';
import {capitalizeFieldNames, CustomColor} from '../../../ults';
import {XuatCuonLineAtom, XuatCuonStatusAtom} from '../store/XuatCuonStore';
import {
  getOnHandType,
  getOnHandTypeRespon,
  LineXuatCuon,
  XuatCuonListType,
} from '../Type/XuatCuonType';
import {LocatorType, WarehouseType} from '../../WareHouse/type';
import {get_cus, post_cus} from '../../../Base/api/api_service';
import WarehouseModal from '../../WareHouse/Modal/WarehouseModal';
import {AppColors} from '../../../../colors';
const XuatCuonDetail = () => {
  const navigate = useNavigation();
  const today = new Date();

  //! recoil
  const statusTypeValueXuatCuon = useRecoilValue(XuatCuonStatusAtom);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const detailXuatCuon = useRecoilValue(XuatCuonLineAtom);
  const [settings, setSettings] = useRecoilState(settingStore);
  //! useState
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [warehouseList, setWarehouseList] = useState<WarehouseType[]>([]);
  const [showSaveLocator, setShowSaveLocator] = useState(false);
  const [locatorList, setLocatorList] = useState<LocatorType[]>([]);
  const [fieldFocus, setFieldFocus] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraField, setCameraField] = useState<string>('');
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
  const [formValues, setFormValues] = useState<XuatCuonListType>({
    maKho: '',
    ngayTao: today,
    lines: [],
  });
  const [completeDisable, setCompleteDisable] = useState(false);

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
  useEffect(() => {
    console.log('detailXuatCuon: ', detailXuatCuon);
    if (statusTypeValueXuatCuon === 'EDIT') {
      const cloneFormValues = {
        ...detailXuatCuon,
        maViTriNhap: '',
        maViTriXuat: '',
        maQr: '',
      };
      setFormValues(cloneFormValues);
      handleGetListWarehouse(detailXuatCuon.maKho); // show warehouse value when edit
    }
    handleGetListWarehouse();
    handleGetListLocator();
  }, []);
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

  const handleSaveForm = async () => {
    formValues.maKho = warehouseValue.maKho;
    // formValues.ngayTao = new Date();
    console.log('formValues: ', formValues);
    const formattedFormValues: any = capitalizeFieldNames(formValues);
    console.log('formattedFormValues: ', formattedFormValues);
    formattedFormValues.NgayTao = new Date();
    setLoadingAtom(true);
    try {
      post_cus(
        statusTypeValueXuatCuon === 'EDIT'
          ? `/XuatCuon/update`
          : `/XuatCuon/create`,
        formattedFormValues,
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
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Lưu phiếu thất bại, kiểm tra lại kết nối',
      });
    } finally {
      setLoadingAtom(false);
    }
  };
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
  const handleOpenWarehouseModal = () => {
    setWarehouseModal(!warehouseModal);
  };
  const handleGetItem = async (param: getOnHandType, MaQR: string) => {
    // console.log('param nhap xuat: ', param);
    setLoadingAtom(true);
    try {
      // Gọi API bằng phương thức GET với các tham số
      const item = await get_cus(
        `/XuatCuon/get_onhand_items?maKho=${param.maKho}&maVatTu=${param.maVatTu}&soLo=${param.soLo}`,
        {},
      );

      // Kiểm tra và xử lý dữ liệu trả về
      if (item && item.data && item.data.length > 0) {
        const lineScan = item.data; // Lấy mảng dữ liệu mới từ API
        console.log('lineScan: ', item);
        // Thêm mã cuộn và mã QR vào từng dòng và định dạng lại
        const formatLine = lineScan.map((line: getOnHandTypeRespon) => {
          console.log('line: ', line);
          return {
            maCuon: line.MaCuon, // Gán mã cuộn từ API vào thuộc tính MaCuon
            maQR: MaQR, // Gán mã QR đã quét vào dòng
            maViTriNhap: '', // Để trống vị trí nhập ban đầu
            maViTriXuat: line.ViTriXuat, // Để trống vị trí nhập ban đầu
            ten: line.TenVatTu, // Gán tên từ API vào thuộc tính Ten
            ma: line.MaVatTu,
            sLXuat: line.SLXuat,
          };
        });
        console.log('formatLine: ', formatLine);
        // Cập nhật lại formValues với dòng mới
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          maQr: '',
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
          text2: 'Không có dữ liệu từ qrcode.',
        });
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          maQr: '',
        }));
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

  const handleGetPallet = async (MaQR: string) => {
    // console.log('param nhap xuat: ', param);
    setLoadingAtom(true);
    try {
      // Gọi API bằng phương thức GET với các tham số
      const item = await get_cus(`/XuatCuon/get_palet_item?Sct=${MaQR}`, {});

      // Kiểm tra và xử lý dữ liệu trả về
      if (item && item.data && item.data.length > 0) {
        const lineScan = item.data; // Lấy mảng dữ liệu mới từ API
        console.log('lineScan: ', item);
        // Thêm mã cuộn và mã QR vào từng dòng và định dạng lại
        const formatLine = lineScan.map((line: getOnHandTypeRespon) => {
          console.log('line: ', line);
          return {
            maCuon: line.MaCuon, // Gán mã cuộn từ API vào thuộc tính MaCuon
            maQR: MaQR, // Gán mã QR đã quét vào dòng
            maViTriNhap: '', // Để trống vị trí nhập ban đầu
            maViTriXuat: line.ViTriXuat, // Để trống vị trí nhập ban đầu
            ten: line.TenVatTu, // Gán tên từ API vào thuộc tính Ten
            ma: line.MaVatTu,
            slXuat: line.SLXuat,
          };
        });
        console.log('formatLine: ', formatLine);
        // Cập nhật lại formValues với dòng mới
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          maQr: '',
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
          text2: 'Không có dữ liệu từ qrcode.',
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
  const handleQRCodeScanned = (scannedQRCode: string, fieldFocus: string) => {
    const scannedQRCodeTrim = scannedQRCode.trim(); // Trim để loại bỏ khoảng trắng thừa nếu có
    // console.log('Trimmed Scanned QR Code:', scannedQRCodeTrim);

    if (scannedQRCodeTrim.includes('#')) {
      const [MaVatTu, soLo] = scannedQRCodeTrim.split('#');

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
        console.log('warehouseValue: ', warehouseValue.maKho);
        if (warehouseValue.maKho === '') {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Vui lòng chọn kho',
          });
        } else {
          const paramItem: getOnHandType = {
            maKho: warehouseValue.maKho,
            maVatTu: MaVatTu,
            soLo: soLo,
          };

          handleGetItem(paramItem, scannedQRCodeTrim);
        }
      }
    } else if (fieldFocus === 'maViTriNhap') {
      // Xử lý khi quét QR cho vị trí nhập
      const locationFilter = locatorList.find(
        (locator: LocatorType) => locator.maLocator === scannedQRCode,
      );
      if (locationFilter) {
        const updatedLines = formValues.lines.map((line: LineXuatCuon) => ({
          ...line,
          maViTriNhap: locationFilter.maLocator,
        }));
        setFormValues(prevValues => ({
          ...prevValues,
          maViTriNhap: locationFilter.maLocator,
          lines: updatedLines,
        }));
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Mã vị trí nhập đã được gán.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: `Không tìm thấy vị trí ${scannedQRCode} trong kho`,
        });
      }
    } else if (fieldFocus === 'maViTriXuat') {
      // Xử lý khi quét QR cho vị trí xuất
      const locationFilter = locatorList.find(
        (locator: LocatorType) => locator.maLocator === scannedQRCode,
      );
      if (locationFilter) {
        const updatedLines = formValues.lines.map((line: LineXuatCuon) => ({
          ...line,
          maViTriXuat: locationFilter.maLocator,
        }));
        setFormValues(prevValues => ({
          ...prevValues,
          maViTriXuat: locationFilter.maLocator,
          lines: updatedLines,
        }));
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Mã vị trí xuất đã được gán.',
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
  const handleChangeInput = (value: any, field: string) => {
    if (field === 'maQr') {
      // Chỉ process nếu có '#' (format QR code)
      if (value.includes('#')) {
        handleQRCodeScanned(value, field);
      }
    } else if (field === 'maPalet') {
      if (value.trim().length > 0) {
        handleGetPallet(value);
      }
    } else if (field === 'maViTriXuat' || field === 'maViTriNhap') {
      // Nếu camera OFF, xử lý manual input
      if (!settings.useCameraScan) {
        handleGetLocator(value);
      }
    }
  };
  const handleGetLocator = (locator: string) => {
    const locatorFound = locatorList.find(
      (l: LocatorType) => l.maLocator === locator,
    );

    if (locatorFound) {
      // Kiểm tra cảnh báo dựa trên fieldFocus
      if (fieldFocus === 'maViTriXuat') {
        Alert.alert(
          'Xác nhận',
          'Bạn sắp thay đổi tất cả vị trí xuất trong danh sách. Bạn có chắc chắn muốn tiếp tục?',
          [
            {
              text: 'Hủy',
              style: 'cancel',
              onPress: () => console.log('Hủy thay đổi vị trí xuất'),
            },
            {
              text: 'Đồng ý',
              onPress: () => updateLines(locatorFound),
            },
          ],
        );
      } else if (fieldFocus === 'maViTriNhap') {
        const hasExistingValues = formValues.lines.some(
          (line: LineXuatCuon) => line.maViTriNhap,
        );

        if (hasExistingValues) {
          Alert.alert(
            'Xác nhận',
            'Một số vị trí nhập đã có giá trị. Bạn có chắc chắn muốn thay đổi?',
            [
              {
                text: 'Hủy',
                style: 'cancel',
                onPress: () => console.log('Hủy thay đổi vị trí nhập'),
              },
              {
                text: 'Đồng ý',
                onPress: () => updateLines(locatorFound),
              },
            ],
          );
        } else {
          updateLines(locatorFound);
        }
      } else {
        updateLines(locatorFound);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tìm thấy vị trí.',
      });
    }
  };

  const updateLines = (locatorFound: LocatorType) => {
    const updatedLines = formValues.lines.map((line: LineXuatCuon) => {
      if (fieldFocus === 'maViTriNhap') {
        if (line.maCuon) {
          return {
            ...line,
            maViTriNhap: locatorFound.maLocator, // Gán mã vị trí mới cho dòng
          };
        }
        return line;
      } else {
        if (line.maCuon) {
          return {
            ...line,
            maViTriXuat: locatorFound.maLocator, // Gán mã vị trí mới cho dòng
          };
        }
        return line;
      }
    });

    console.log('updatedLines: ', updatedLines);

    setFormValues((prevValues: XuatCuonListType) => ({
      ...prevValues,
      lines: updatedLines as LineXuatCuon[], // Cập nhật danh sách Lines
    }));

    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Mã vị trí đã được gán cho cuộn.',
    });
  };
  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };
  const handleClearMaCuon = () => {
    setFormValues((prevValues: XuatCuonListType) => ({
      ...prevValues,
      maQr: '',
    }));
  };
  const handleClearLocator = (type: string) => {
    if (type === 'maViTriNhap') {
      setFormValues((prevValues: XuatCuonListType) => ({
        ...prevValues,
        maViTriNhap: '',
      }));
    } else {
      setFormValues((prevValues: XuatCuonListType) => ({
        ...prevValues,
        maViTriXuat: '',
      }));
    }
  };

  const handleScanResult = (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData, 'Field:', cameraField);
    if (cameraField === 'maQr') {
      handleQRCodeScanned(qrData, 'maQr');
    } else if (cameraField === 'maPalet') {
      handleGetPallet(qrData);
    } else if (cameraField === 'maViTriXuat') {
      handleQRCodeScanned(qrData, 'maViTriXuat');
    } else if (cameraField === 'maViTriNhap') {
      handleQRCodeScanned(qrData, 'maViTriNhap');
    }
    setShowCameraModal(false);
    setCameraField('');
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
  const handleDeleteItem = (index: number) => {
    // Xóa dòng tại chỉ mục `index` khỏi `formValues.Lines`
    console.log('index: ', index);
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      lines: prevFormValues.lines.filter((_, i) => i !== index),
    }));
  };
  const handleGetWarehouse = (warehouse: WarehouseType) => {
    setWarehouseValue(warehouse);
  };
  const generalTable = (data: any) => {
    let rows: any = [];
    if (data) {
      data.map((value: LineXuatCuon, key: number) => {
        // console.log("🚀 ~ file: index.js:71 ~ data.map ~ value:", value);
        rows.push(
          <View key={key} style={{...DetailXuatCuonStyle.rowTable}}>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 50}}>
              <Text>{key + 1}</Text>
            </View>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 160}}>
              <Text>{value.maCuon}</Text>
            </View>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 100}}>
              <Text>{value.ma}</Text>
            </View>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 200}}>
              <Text>{value.ten}</Text>
            </View>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 120}}>
              <Text>{value.maViTriNhap}</Text>
            </View>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 120}}>
              <Text>{value.maViTriXuat}</Text>
            </View>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 120}}>
              <Text>{value.slXuat}</Text>
            </View>
            <View style={{...DetailXuatCuonStyle.headerCell, width: 200}}>
              <Text>{value.maQR}</Text>
            </View>

            <View style={{...DetailXuatCuonStyle.headerCell, width: 55}}>
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
      <View style={DetailXuatCuonStyle.table}>
        <ScrollView horizontal={true}>
          <View style={{flexDirection: 'column'}}>
            <View style={DetailXuatCuonStyle.headerTable}>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 50}}>
                <Text>STT</Text>
              </View>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 160}}>
                <Text>Mã cuộn</Text>
              </View>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 100}}>
                <Text>Mã</Text>
              </View>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 200}}>
                <Text>Tên</Text>
              </View>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 120}}>
                <Text>Mã vị trí nhập</Text>
              </View>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 120}}>
                <Text>Mã vị trí xuất</Text>
              </View>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 120}}>
                <Text>SL xuất</Text>
              </View>
              <View style={{...DetailXuatCuonStyle.headerCell, width: 200}}>
                <Text>Mã QR</Text>
              </View>

              <View style={{...DetailXuatCuonStyle.headerCell, width: 50}}>
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
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <View style={DetailXuatCuonStyle.inventory}>
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
          title={'Xuất cuộn'}
          // handleRightIconButton={handleRightIconButton}
        />
        <View>
          <ScrollView>
            <View style={DetailXuatCuonStyle.header}>
              <View style={DetailXuatCuonStyle.headerLine}>
                <View style={DetailXuatCuonStyle.groupHeaderItem}>
                  <View
                    style={{
                      ...DetailXuatCuonStyle.headerRef,
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        ...DetailXuatCuonStyle.headerText,
                        fontWeight: 'bold',
                      }}>
                      Thời gian:{' '}
                    </Text>
                    <Text
                      style={{
                        ...DetailXuatCuonStyle.headerText,
                        color: AppColors.primary,
                      }}>
                      {convertDate(
                        statusTypeValueXuatCuon === 'EDIT'
                          ? formValues.ngayTao
                          : today,
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {statusTypeValueXuatCuon === 'EDIT' && (
              <View style={DetailXuatCuonStyle.header}>
                <View style={DetailXuatCuonStyle.headerLine}>
                  <View style={DetailXuatCuonStyle.groupHeaderItem}>
                    <View
                      style={{
                        ...DetailXuatCuonStyle.headerRef,
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          ...DetailXuatCuonStyle.headerText,
                          fontWeight: 'bold',
                        }}>
                        Số CT:{' '}
                      </Text>
                      <Text style={{...DetailXuatCuonStyle.headerText}}>
                        {formValues.soCT}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            <View style={DetailXuatCuonStyle.headerLine}>
              <View style={DetailXuatCuonStyle.groupHeaderItem}>
                <View
                  style={{
                    ...DetailXuatCuonStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  {/* <View style={{ ...DetailXuatCuonStyle.warehouseView }}> */}
                  <Text
                    style={{
                      ...DetailXuatCuonStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    Mã kho:{' '}
                  </Text>

                  <Pressable
                    disabled={completeDisable}
                    onPress={() => handleOpenWarehouseModal()}
                    style={{
                      ...DetailXuatCuonStyle.warehousePressible,
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

            <View style={DetailXuatCuonStyle.headerLine}>
              <View style={DetailXuatCuonStyle.groupHeaderItem}>
                <View
                  style={{
                    ...DetailXuatCuonStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...DetailXuatCuonStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    QR cuộn:{' '}
                  </Text>
                  <View style={DetailXuatCuonStyle.textInputWithButton}>
                    <TextInput
                      onChangeText={text => handleChangeInput(text, 'maQr')}
                      value={formValues.maQr}
                      onFocus={() => handleFocus('maQr')}
                      placeholder="Mã QR"
                    />
                    <View style={{flexDirection: 'row'}}>
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('maQr');
                            setShowCameraModal(true);
                          }}
                          style={DetailXuatCuonStyle.iconPressable}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleClearMaCuon}
                        style={DetailXuatCuonStyle.iconPressable}>
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
            <View style={DetailXuatCuonStyle.headerLine}>
              <View style={DetailXuatCuonStyle.groupHeaderItem}>
                <View
                  style={{
                    ...DetailXuatCuonStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...DetailXuatCuonStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    QR Palet:{' '}
                  </Text>
                  <View style={DetailXuatCuonStyle.textInputWithButton}>
                    <TextInput
                      onChangeText={text => handleChangeInput(text, 'maPalet')}
                      value={formValues.maQr}
                      onFocus={() => handleFocus('maPalet')}
                      placeholder="Mã QR"
                    />
                    <View style={{flexDirection: 'row'}}>
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('maPalet');
                            setShowCameraModal(true);
                          }}
                          style={DetailXuatCuonStyle.iconPressable}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleClearMaCuon}
                        style={DetailXuatCuonStyle.iconPressable}>
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
            <View style={DetailXuatCuonStyle.headerLine}>
              <View style={DetailXuatCuonStyle.groupHeaderItem}>
                <View
                  style={{
                    ...DetailXuatCuonStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...DetailXuatCuonStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    Mã vị trí xuất:{' '}
                  </Text>
                  <View style={DetailXuatCuonStyle.textInputWithButton}>
                    <TextInput
                      onChangeText={text =>
                        handleChangeInput(text, 'maViTriXuat')
                      }
                      value={formValues.maViTriXuat}
                      onFocus={() => handleFocus('maViTriXuat')}
                      placeholder="Vị trí nhập"
                    />
                    <View style={{flexDirection: 'row'}}>
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('maViTriXuat');
                            setShowCameraModal(true);
                          }}
                          style={DetailXuatCuonStyle.iconPressable}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() => handleClearLocator('maViTriXuat')}
                        style={DetailXuatCuonStyle.iconPressable}>
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
            <View style={DetailXuatCuonStyle.headerLine}>
              <View style={DetailXuatCuonStyle.groupHeaderItem}>
                <View
                  style={{
                    ...DetailXuatCuonStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...DetailXuatCuonStyle.headerText,
                      fontWeight: 'bold',
                      width: 70,
                    }}>
                    Mã vị trí nhập:{' '}
                  </Text>
                  <View style={DetailXuatCuonStyle.textInputWithButton}>
                    <TextInput
                      onChangeText={text =>
                        handleChangeInput(text, 'maViTriNhap')
                      }
                      value={formValues.maViTriNhap}
                      onFocus={() => handleFocus('maViTriNhap')}
                      placeholder="Vị trí nhập"
                    />
                    <View style={{flexDirection: 'row'}}>
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('maViTriNhap');
                            setShowCameraModal(true);
                          }}
                          style={DetailXuatCuonStyle.iconPressable}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() => handleClearLocator('maViTriNhap')}
                        style={DetailXuatCuonStyle.iconPressable}>
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
export default XuatCuonDetail;
