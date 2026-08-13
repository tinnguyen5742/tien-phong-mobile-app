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
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {settingStore} from '../../../Store/settingStore';
import {getSettingValue} from '../../Login/store/asyncUserStorage';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import ModalOptions from '../../../Base/ModalOptions/ModalOptionsComponent';
import HoneywellScanner from '../../../Base/ScannerModule';
import {getApi, postApi} from '../../../Base/api/api_service';
import {CustomColor, device, formatDate} from '../../../ults';
import {getLineLotIndexStore} from '../../Inventory/store/inventoryStore';
import {userAtom} from '../../Login/store/userAtom';
import {loadingStore} from '../../../Store/loadingStore';
import {useNavigation} from '@react-navigation/native';
import {BoxDetailStyle} from './style';
import {BoxDetailAtom, BoxInfoAtomStatus} from '../Atom/BoxInfoAtom';
import {BoxInfoLineType, BoxInfoTypeFromResponse} from '../Types/BoxInfoType';
import {ModalPrinterType} from '../../Produce/type';
import PrinterModal from '../../Produce/Modal/PrinterModal';
import TcpSocket from 'react-native-tcp-socket';
import ErrorModal from '../../Produce/Modal/ErrorModal';
import {AppColors} from '../../../../colors';

const BoxDetail = () => {
  const navigate = useNavigation();
  //! recoil
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const boxInfoDetailAtom = useRecoilValue(BoxDetailAtom);
  const today = new Date();
  const [statusBoxInfo, setStatusBoxInfo] = useRecoilState(BoxInfoAtomStatus);
  const [settings, setSettings] = useRecoilState(settingStore);
  //! useState
  const [fieldFocus, setFieldFocus] = useState('');
  const [printerModal, setPrinterModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraField, setCameraField] = useState<string>('');

  const [valueFromPrinterModal, setValueFromPrinterModal] =
    useState<ModalPrinterType>();
  const [ipPrinter, setIpPrinter] = useState('192.168.1.42');
  const [reloadLocalIp, setReloadLocalIp] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [formValues, setFormValues] = useState<BoxInfoTypeFromResponse>({
    id: 0,
    soCT: '',
    ngayTao: today,
    lines: [] as BoxInfoLineType[],
  });
  const PrinterData: ModalPrinterType[] = [{id: 1, value: 'Mẫu tem thùng'}];
  const handleCheckTypeTem = (type: number) => {
    switch (type) {
      case 1:
        return 'TemThung';
    }
  };
  const scrollRef: any = useRef(null);
  const handleGetValueFromPrinter = (printer: ModalPrinterType, ip: string) => {
    setIpPrinter(ip);
    setValueFromPrinterModal(printer);
    handlePrinterModal();
  };
  const handlePrinterModal = () => {
    setPrinterModal(!printerModal);
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
  const handleOpenErrorModal = () => setOpenErrorModal(!openErrorModal);

  const handlePrint = async (sct: string) => {
    if (valueFromPrinterModal && ipPrinter !== '') {
      // console.log('ipPrinter: ', ipPrinter);
      setLoadingAtom(true);
      try {
        // Gọi API để lấy mã ZPL từ server
        const loaiTem = handleCheckTypeTem(valueFromPrinterModal.id);
        const url = `/produce/convertHtmlToImage/${sct}/${loaiTem}`;
        const item = await getApi(url, {}, 'v1');

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
  const handleBack = () => {
    // setLineIndexItem(-1);
    navigate.goBack();
  };

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
    if (statusBoxInfo === 'EDIT') {
      console.log('boxInfoDetailAtom: ', boxInfoDetailAtom);
      setFormValues((prevForm: BoxInfoTypeFromResponse) => {
        return {
          ...prevForm,
          id: boxInfoDetailAtom.id,
          ngayTao: boxInfoDetailAtom.ngayTao,
          soCT: boxInfoDetailAtom.soCT,
          lines: boxInfoDetailAtom.lines,
        };
      });
    } else {
      setFormValues({
        ngayTao: today,
        lines: [] as BoxInfoLineType[],
      });
    }
  }, []);

  const handleSaveForm = async () => {
    if (formValues.lines.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng scan item để lưu',
      });
    }
    formValues.lines.map((line: BoxInfoLineType) => {
      if (line.tenKH === null) {
        return (line.tenKH = '');
      }
    });
    // console.log('formValues: ', formValues);
    setLoadingAtom(true);
    // postApi(statusBoxInfo === 'NEW' ? `/boxinfo/create` : `/boxinfo/update/${formValues.id}`, formValues, (err: any, resp: any) => {
    //     if (!err) {
    //         console.log('resp: ', resp);
    //         Toast.show({
    //             type: 'success',
    //             text1: 'Thành công',
    //             text2: resp.Message
    //         });

    //         setLoadingAtom(false);
    //         const newFormValues = {
    //             ...resp.data,
    //             maQR: formValues.maQR, // Giữ nguyên mã QR từ form cũ
    //             lines: resp.data?.lines?.map((line: any) => ({
    //                 ...line,
    //                 tenKH: line.tenKH ?? '' // Xử lý giá trị null thành chuỗi rỗng
    //             })) || []
    //         };

    //         console.log('newFormValues: ', newFormValues);

    //         // Cập nhật lại state bằng biến chứa dữ liệu mới
    //         setFormValues(newFormValues);
    //         setStatusBoxInfo('EDIT');
    //         // navigate.goBack();

    //     } else {
    //         console.log('err: ', err);
    //         Toast.show({
    //             type: 'error',
    //             text1: 'Lỗi',
    //             text2: err
    //         });
    //         setLoadingAtom(false);
    //     }
    // });
  };
  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };

  const handleChangeInput = (value: any, field: string) => {
    handleQRCodeScanned(value);
  };
  const handleClearQrcode = () => {
    setFormValues((prevValues: BoxInfoTypeFromResponse) => ({
      ...prevValues,
      maQR: '',
    }));
  };

  const handleScanResult = (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData);
    handleQRCodeScanned(qrData);
    setShowCameraModal(false);
    setCameraField('');
  };
  const handleQRCodeScanned = (scannedQRCode: string) => {
    const scannedQRCodeTrim = scannedQRCode.trim(); // Trim để loại bỏ khoảng trắng thừa nếu có
    // console.log('Trimmed Scanned QR Code:', scannedQRCodeTrim);

    if (scannedQRCodeTrim.includes('#')) {
      const [MaBTP_Tp, soLo] = scannedQRCodeTrim.split('#');

      // Kiểm tra xem mã QR code đã tồn tại trong danh sách Lines chưa
      const existingLine = formValues.lines.some(
        line => line.soQRCode === scannedQRCodeTrim,
      );
      setFormValues(prevValues => ({
        ...prevValues,
        maQR: scannedQRCodeTrim,
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
    } else {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Không tìm thấy vị trí ${scannedQRCode} trong kho`,
      });
    }
  };
  const handleGetItem = async (param: any, MaQR: string) => {
    setLoadingAtom(true);
    console.log('param nhap xuat: ', param);
    try {
      const url = `/boxinfo/get_line_box_info/${param.maBTP_Tp}/${param.soLo}`;
      const item = await getApi(url, {}, 'v1');

      // Kiểm tra và xử lý dữ liệu trả về
      if (item && item.data) {
        const lineScan = item.data; // Lấy mảng dữ liệu mới từ API

        // Thêm mã cuộn và mã QR vào từng dòng và định dạng lại
        const formatLine = lineScan.map((line: BoxInfoLineType) => {
          console.log('line: ', line);
          return {
            caSX: line.caSX, // Gán mã cuộn từ API vào thuộc tính MaCuon
            maQR: MaQR, // Gán mã QR đã quét vào dòng
            ten: line.ten, // Gán tên từ API vào thuộc tính Ten
            maySX: line.maySX,
            soQRCode: line.soQRCode,
            lsx: line.lsx,
            ngaySX: line.ngaySX,
            slKgGross: line.slKgGross,
            slKgNet: line.slKgNet,
            slM2: line.slM2,
            soLo: line.soLo,
            tenKH: line.tenKH,
            slmd: line.slmd,
            maKH: line.maKH,
            maTP: line.maTP,
            slgd: line.slgd,
          } as BoxInfoLineType;
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
  const generalTable = (data: any) => {
    let rows: any = [];

    // Cập nhật fieldNames để bao gồm width cho từng cột
    const fieldNames = [
      {field: 'lsx', label: 'LSX', width: 150},
      {field: 'ten', label: 'Tên', width: 220},
      {field: 'soLo', label: 'Số Lô', width: 150},
      {field: 'ngaySX', label: 'Ngày Sản Xuất', width: 160},
      {field: 'maySX', label: 'Máy Sản Xuất', width: 160},
      {field: 'slKgGross', label: 'SL KG Gross', width: 100},
      {field: 'slKgNet', label: 'SL KG Net', width: 100},
      {field: 'slM2', label: 'SLM2', width: 100},
      {field: 'slmd', label: 'SLMD', width: 120},
      {field: 'tenKH', label: 'Tên KH', width: 120},
      {field: 'maKH', label: 'Mã KH', width: 120},
      {field: 'maTP', label: 'Mã TP', width: 120},
      {field: 'slgd', label: 'SLGD', width: 120},
    ];

    if (data) {
      data.map((value: any, key: number) => {
        rows.push(
          <View
            key={key}
            style={{
              ...BoxDetailStyle.rowTable,
              borderWidth: 0,
              borderColor: CustomColor.colorList.red,
            }}>
            <View style={{...BoxDetailStyle.headerCell, width: 50}}>
              <Text style={{color: '#333'}}>{key + 1}</Text>
            </View>
            {fieldNames.map((field, index) => (
              <View
                key={index}
                style={{...BoxDetailStyle.headerCell, width: field.width}}>
                {field.field === 'ngaySX' ? (
                  <Text>
                    {formatDate(
                      value[field.field] ? new Date(value[field.field]) : today,
                    )}
                  </Text>
                ) : (
                  <Text>{value[field.field] ? value[field.field] : ''}</Text>
                )}
              </View>
            ))}
            <TouchableOpacity
              onPress={() => handleDeleteItem(key)}
              style={{...BoxDetailStyle.headerCell, width: 35}}>
              <View>
                <FontAwesomeIcon
                  icon={faTrash}
                  size={15}
                  color={AppColors.primary}
                />
              </View>
            </TouchableOpacity>
          </View>,
        );
      });
    }

    return (
      <View style={BoxDetailStyle.viewTable}>
        <ScrollView horizontal={true} style={{width: device.width * 0.99}}>
          <View style={BoxDetailStyle.table}>
            <View style={BoxDetailStyle.headerTable}>
              <View style={{...BoxDetailStyle.headerCell, width: 50}}>
                <Text>STT</Text>
              </View>

              {fieldNames.map((field, index) => (
                <View
                  key={index}
                  style={{...BoxDetailStyle.headerCell, width: field.width}}>
                  <Text>{field.label}</Text>
                </View>
              ))}
              <View style={{...BoxDetailStyle.headerCell, width: 30}}>
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
              style={{padding: 1, height: '90%', width: '100%'}}
              horizontal={true}>
              <ScrollView style={{height: device.height * 0.5}} ref={scrollRef}>
                {rows}
              </ScrollView>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  const handleDeleteItem = (index: number) => {
    console.log('index: ', index);
    // Xóa dòng tại chỉ mục `index` khỏi `formValues.Lines`
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      lines: prevFormValues.lines.filter((_, i) => i !== index),
    }));
  };

  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <View style={BoxDetailStyle.inventory}>
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
          title="Thông tin thùng"
        />
        <View>
          <ScrollView>
            <View style={BoxDetailStyle.header}>
              <View style={BoxDetailStyle.headerLine}>
                <View style={BoxDetailStyle.groupHeaderItem}>
                  <View
                    style={{
                      ...BoxDetailStyle.headerRef,
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        ...BoxDetailStyle.headerText,
                        fontWeight: 'bold',
                      }}>
                      Thời gian:{' '}
                    </Text>
                    <Text
                      style={{
                        ...BoxDetailStyle.headerText,
                        color: AppColors.primary,
                      }}>
                      {convertDate(today)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {statusBoxInfo === 'EDIT' && (
              <View style={BoxDetailStyle.header}>
                <View style={BoxDetailStyle.headerLine}>
                  <View style={BoxDetailStyle.groupHeaderItem}>
                    <View
                      style={{
                        ...BoxDetailStyle.headerRef,
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          ...BoxDetailStyle.headerText,
                          fontWeight: 'bold',
                        }}>
                        Số CT:{' '}
                      </Text>
                      <Text style={{...BoxDetailStyle.headerText}}>
                        {formValues.soCT}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            <View style={BoxDetailStyle.headerLine}>
              <View style={BoxDetailStyle.groupHeaderItem}>
                <View
                  style={{
                    ...BoxDetailStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...BoxDetailStyle.headerText,
                      fontWeight: 'bold',
                      width: 60,
                    }}>
                    Mã QR:{' '}
                  </Text>
                  <View style={BoxDetailStyle.textInputWithButton}>
                    <TextInput
                      //   editable={!disableLocator}
                      onChangeText={text => handleChangeInput(text, 'maQR')}
                      value={formValues.maQR}
                      onFocus={() => handleFocus('maQR')}
                      placeholder="Mã cuộn nhập"
                    />
                    <View style={{flexDirection: 'row'}}>
                      {settings.useCameraScan && (
                        <Pressable
                          onPress={() => {
                            setCameraField('maQR');
                            setShowCameraModal(true);
                          }}
                          style={BoxDetailStyle.iconPressable}>
                          <FontAwesomeIcon
                            icon={faCamera}
                            size={18}
                            color={AppColors.primary}
                          />
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleClearQrcode}
                        style={BoxDetailStyle.iconPressable}>
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
            <View style={BoxDetailStyle.headerLine}>
              <View style={BoxDetailStyle.groupHeaderItem}>
                <View
                  style={{
                    ...BoxDetailStyle.headerRef,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      ...BoxDetailStyle.headerText,
                      fontWeight: 'bold',
                      width: 100,
                    }}>
                    Loại mẫu in{' '}
                  </Text>
                  <Pressable
                    style={{...BoxDetailStyle.warehousePressible, width: 230}}
                    onPress={handlePrinterModal}>
                    <Text>
                      {valueFromPrinterModal?.value
                        ? valueFromPrinterModal.value
                        : 'Vui lòng chọn mẫu in'}
                    </Text>
                  </Pressable>
                  {formValues.soCT && (
                    <Pressable
                      style={{
                        width: 50,
                        height: 45,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: AppColors.primary,
                      }}
                      onPress={() =>
                        handlePrint(formValues.soCT ? formValues.soCT : '')
                      }>
                      <FontAwesomeIcon
                        icon={faPrint}
                        size={18}
                        color={CustomColor.colorList.shadowWhite}
                      />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
            {/* <View style={{ ...BoxDetailStyle.headerLine }}>
                        <Text style={{ ...BoxDetailStyle.headerText }}>Loại mẫu in</Text>
                        <Pressable style={BoxDetailStyle.warehousePressible} onPress={handlePrinterModal}>
                            <Text>{valueFromPrinterModal?.value ? valueFromPrinterModal.value : 'Vui lòng chọn mẫu in'}</Text>
                        </Pressable>
                    </View> */}
            <View>{generalTable(formValues?.lines)}</View>
          </ScrollView>
        </View>
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
      </View>
    </CameraScannerWrapper>
  );
};
export default BoxDetail;
