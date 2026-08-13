import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import {
  CustomColor,
  device,
  formatDate,
  formatStringUpcase,
  formatTime,
} from '../../../ults';
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
import {getApi, postApi} from '../../../Base/api/api_service';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Toast from 'react-native-toast-message';
import {
  ProductSemiProductType,
  CoronaType,
  LaneType,
  MachineType,
  StaffType,
  ProduceLineForm,
  StateType,
} from '../type';
import ProductSemiProductModal from './ProductSemiProductModal';
import DatePicker from 'react-native-date-picker';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {settingStore} from '../../../Store/settingStore';
import {useNavigation} from '@react-navigation/native';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {loadingStore} from '../../../Store/loadingStore';
import WarehouseModal from '../../WareHouse/Modal/WarehouseModal';
import {WarehouseType} from '../../WareHouse/type';
import StateModalList from './StateModal';
import {AppColors} from '../../../../colors';
// import MachineModal from "./MachinesModal";
// import LaneModal from "./LaneModal";
// import StaffModal from "./StaffModal";
// import CoronaModal from "./CoronaModal";

type LineModalProps = {
  data: ProduceLineForm;
  handleOpenLineModal: () => void;
  onSubmit: (data: ProduceLineForm) => void;
  open: boolean;
  status: string;
  lsx: string;
  setStatusLine: (status: string) => void;
  listWarehouses: WarehouseType[];
  listStates: StateType[];
  actionType: string;
  // khoTKCat: number;
  // stateValue: StateType;
  // maCD: string;
  // machines: MachineType[];
};

// Component phụ để giao diện đồng bộ
const FormRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View className="flex-row justify-between items-center mb-4">
    <Text className="text-slate-600 font-medium flex-1">{label}</Text>
    <View className="w-[55%]">{children}</View>
  </View>
);

const LineModalInput = (props: LineModalProps) => {
  const {
    data,
    handleOpenLineModal,
    onSubmit,
    open,
    status,
    setStatusLine,
    actionType,
  } = props;
  const setLoadingAtom = useSetRecoilState(loadingStore);

  const navigate = useNavigation();
  const [settings, setSettings] = useRecoilState(settingStore);

  const [lineForm, setLineForm] = useState<ProduceLineForm>(data);
  const [loading, setLoading] = useState(false);
  const [productSemiProductValue, setProductSemiProductValue] =
    useState<ProductSemiProductType>({dvt: '', maTP: '', tenVatTu: ''});
  const [productSemiProduct, setProductSemiProduct] = useState<
    ProductSemiProductType[]
  >([]);
  const [productSemiProductModal, setProductSemiProductModal] = useState(false);
  const [dateSx, setDateSx] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [DvtGoc, setDvtGoc] = useState('');

  const [warehouseModal, setWarehouseModal] = useState(false);
  const [stateModal, setStateModal] = useState(false);
  const [stateValue, setStateValue] = useState<StateType>({
    dienGiai: 'Chọn công đoạn',
  } as StateType);

  // ✅ Reset dữ liệu khi mở Modal
  useEffect(() => {
    if (open) {
      setLineForm(data);
      console.log('lineForm', productSemiProductValue);
      // getMachine();
      // setDateSx(new Date(data.ngaySX || new Date()));

      if (status !== 'NEW') {
        const editValue = props.data;
        setLineForm(editValue);
        // console.log("Line form data edit:", editValue);
        // handleGetNVSX();
        // setCorona({ value: editValue.matCorona || 'Chọn mặt corona' });
      }
    }
  }, [open, data]);

  const handleChangeFormLine = (key: keyof ProduceLineForm, value: any) => {
    setLineForm(prev => ({...prev, [key]: value}));
  };

  const handleSave = () => {
    // 1. Kiểm tra an toàn xem lineForm có tồn tại hay không
    if (!lineForm) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Dữ liệu form không hợp lệ',
      });
      return;
    }

    // 3. Xử lý thời gian an toàn
    const dateSxObject = dateSx ? new Date(dateSx) : new Date();
    const finalDateSx = new Date(dateSxObject.getTime() + 7 * 60 * 60 * 1000);

    // 4. Bẫy ID dựa trên trạng thái (status) tránh truyền undefined cho tầng cha
    const finalId = status === 'NEW' ? 0 : data?.id || 0;
    // 5. Gom dữ liệu gửi đi (Đảm bảo tất cả các trường không có trường nào mang giá trị undefined)
    const payload: ProduceLineForm = {
      ...lineForm, // Sao chép an toàn
      id: finalId,
      maBTP_TP: lineForm.maBTP_TP || '',
      tenVatTu: lineForm.tenVatTu || '',
      dvtGoc: lineForm?.dvtGoc || '',
      congDoan: lineForm?.congDoan || '',
      luongThucTe: Number(lineForm?.luongThucTe) || 0,
      soLo: lineForm?.soLo || '',
      ghiChu: lineForm?.ghiChu || '',
      ActionType: actionType || '',
      // slM2: Number(lineForm?.slM2) || 0,
      // ngaySX: finalDateSx.toISOString() as any, // Ép kiểu chuỗi ngày chuẩn
      // gioSX: formatTime(dateSxObject),
    };

    console.log('>>> Dữ liệu cuối cùng gửi đi an toàn:', payload);
    try {
      if (typeof onSubmit === 'function') {
        onSubmit(payload); // Gửi về detail.tsx

        handleOpenLineModal(); // Đóng modal an toàn

        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: status === 'NEW' ? 'Đã thêm dòng mới' : 'Đã cập nhật dòng',
        });
      } else {
        console.error('onSubmit props không phải là một hàm!');
      }
    } catch (error) {
      console.error('Lỗi crash xảy ra tại hàm onSubmit của file cha:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi hệ thống',
        text2: 'Không thể xử lý dữ liệu dòng sản xuất',
      });
    }
  };

  const handleNumericInput = (key: string, text: string) => {
    const decimalRegex = /^-?\d*\.?\d*$/;
    if (decimalRegex.test(text)) {
      setLineForm(prev => ({...prev, [key]: text}));
    } else {
      console.warn('Giá trị nhập không hợp lệ:', text);
    }
  };

  const handleGetVTByMVT = async (mvt: string) => {
    try {
      const url = `/materials/${mvt}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      // console.log("handleGetVTByLSX: ", item)
      if (item?.status === true) {
        let _vt = item.data || [];
        setLineForm((prevValues: any) => ({
          ...prevValues,
          maBTP_TP: _vt.maVatTu,
          tenVatTu: _vt.tenVatTu,
          dvtGoc: _vt.dvt,
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

  const handleGetSoLo = async (maKho: string, mvt: string) => {
    try {
      const url = `/materials/onhand?warehouseCode=${maKho}&materialCode=${mvt}`;
      // console.log("url getCaSX: ", url)
      const item = await getApi(url, {});
      console.log('handleGetSoLo: ', item.data.soLo);
      if (item?.status === true) {
        let _vt = item.data || [];
        setLineForm((prevValues: any) => ({
          ...prevValues,
          soLo: _vt.soLo,
        }));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy soLo',
        });
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Không tìm thấy soLo',
        text2: 'Không tìm thấy soLo',
      });
    }
  };

  const handleCancel = () => {
    setStatusLine('NEW');
    handleOpenLineModal();
  };
  // const handleModalNvsx = () => setModalNvsx(!modalNvsx);

  const handleGetProductSemiProductFromModal = (
    item: ProductSemiProductType,
  ) => {
    setProductSemiProductValue(item);
    handleChangeFormLine('maBTP_TP', item.maTP);
    setProductSemiProductModal(!productSemiProductModal);
  };

  const handleOnChange = (value: any, field: string) => {
    setLineForm((prevValues: any) => {
      // Trường hợp khi cập nhật QR code, chỉ cập nhật LSX mà không ảnh hưởng các trường khác
      if (field === 'qrCode') {
        // console.log('value scan in change text: ', value);
        handleQRCodeScanned(value);
        return prevValues; // Trả về `prevValues` để giữ nguyên các trường khác, tránh bị clear dữ liệu
      }
      // Nếu không phải là QR code, cập nhật bình thường
      return {
        ...prevValues,
        [field]: value,
      };
    });
  };

  // ✅ Xử lý QR Scan - Cập nhật trực tiếp vào lineForm
  const handleQRCodeScanned = (code: string) => {
    const trimmedCode = code.trim();
    console.log('🔍 Scanned QR Code:', trimmedCode);
    // Sử dụng split để tách chuỗi tại vị trí dấu # đầu tiên
    const [maNVL, soLo] = trimmedCode.split('#');
    console.log('📦 Tách chuỗi thành công:', {maNVL, soLo});
    setLineForm((prevValues: any) => ({
      ...prevValues,
      qrCode: trimmedCode,
    }));
    handleGetVTByMVT(maNVL);
    handleGetSoLo(lineForm.maKho, maNVL);
    setShowCameraModal(false);
  };

  const [fieldFocus, setFieldFocus] = useState('');
  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };

  const [showCameraModal, setShowCameraModal] = useState(false);
  const handleClearQrcode = () => {
    setLineForm((prevValues: any) => ({
      ...prevValues,
      qrCode: '',
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

  const handleGetValueFromStateModal = (item: StateType) => {
    setLineForm((prevValues: any) => ({
      ...prevValues,
      congDoan: item.congDoan.toString(),
    }));
  };

  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <Modal animationType="slide" transparent={true} visible={open}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white rounded-[30px] w-full max-h-[85%] shadow-xl overflow-hidden">
            {/* Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800">
                {status === 'NEW' ? 'Tạo mới' : 'Chỉnh sửa'}
              </Text>
              <Pressable
                onPress={handleCancel}
                className="p-2 active:bg-slate-50 rounded-full">
                <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Body */}
            <View className="p-2">
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="px-3 py-2 min-h-[250px]">
                {/* <Text
                  style={{fontFamily: 'monospace'}}
                  className="text-gray-900">
                  {JSON.stringify(lineForm, null, 2)}
                </Text> */}
                {loading ? (
                  <View className="py-10">
                    <ActivityIndicator size="large" color={AppColors.primary} />
                  </View>
                ) : (
                  <View className="pb-10">
                    {/* <FormRow label="Ngày:">
                                            <Text className="text-slate-800 font-bold text-right py-2">
                                                {formatDate(lineForm.gio ? new Date(lineForm.gio) : new Date())}
                                            </Text>
                                        </FormRow> */}

                    {/* QR Code Input */}
                    <View className="flex-row items-center mb-4">
                      <Text className="text-slate-800 w-20">QR NVL</Text>

                      {/* Container chứa Input và Icon: Thêm items-center và khống chế chiều cao h-12 */}
                      <View className="flex-1 ml-2 flex-row items-center border border-slate-200 rounded-xl px-3 h-12 bg-slate-50">
                        <TextInput
                          className="flex-1 h-full text-slate-800 font-bold py-0" // py-0 để xóa padding mặc định của Android
                          onChangeText={text => handleOnChange(text, 'qrCode')}
                          onFocus={() => handleFocus('qrCode')}
                          value={
                            lineForm?.qrCode
                              ? lineForm.qrCode
                              : lineForm.maBTP_TP
                          }
                          placeholder={
                            lineForm?.maBTP_TP
                              ? lineForm.maBTP_TP
                              : 'Vui lòng scan qrcode'
                          }
                          placeholderTextColor="#94a3b8"
                        />

                        {/* Nhóm icon bên phải */}
                        <View className="flex-row items-center">
                          {settings.useCameraScan && (
                            <Pressable
                              onPress={() => setShowCameraModal(true)}
                              className="p-1 mx-1 active:opacity-50">
                              <FontAwesomeIcon
                                icon={faCamera}
                                size={18}
                                color={AppColors.primary}
                              />
                            </Pressable>
                          )}
                          <Pressable
                            onPress={handleClearQrcode}
                            className="p-1 active:opacity-50">
                            <FontAwesomeIcon
                              icon={faXmark}
                              size={18}
                              color="#9ca3af"
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    {/* {productSemiProduct.length > 0 && (
                                            <>
                                                <FormRow label="BTP/Tp:">
                                                    <Pressable onPress={handleModalProductSemiProduct} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                        <Text className="text-slate-800 text-right" numberOfLines={1}>
                                                            { lineForm?.maBTP_TP ? lineForm?.maBTP_TP :  productSemiProductValue?.tenVatTu}
                                                        </Text>
                                                    </Pressable>
                                                </FormRow>
                                            </>
                                        )} */}
                    {lineForm.soLo && (
                      <FormRow label="Số Lot: ">
                        <Text className="text-slate-800 font-bold text-right pr-2">
                          {lineForm.soLo || ''}
                        </Text>
                      </FormRow>
                    )}
                    {lineForm.tenVatTu && (
                      <FormRow label="Tên BTP/NVL: ">
                        <Text
                          numberOfLines={2}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                          className="text-gray-900 font-bold flex-1 text-right ml-4">
                          {lineForm.tenVatTu}
                        </Text>
                      </FormRow>
                    )}
                    {lineForm.dvtGoc && (
                      <FormRow label="ĐVT Gốc:">
                        <Text className="text-slate-800 font-bold text-right pr-2">
                          {lineForm.dvtGoc || ''}
                        </Text>
                      </FormRow>
                    )}

                    {/* <FormRow label={`SL ĐVT gốc ${DvtGoc ? "(" + DvtGoc + ")" : ""}:`}>
                                            <View className="flex-row items-center border border-slate-200 rounded-xl bg-slate-50">
                                                <Text className="text-red-500 absolute left-2 z-10">*</Text>
                                                <TextInput
                                                    className="flex-1 p-2 text-right font-bold text-slate-800"
                                                    keyboardType="numeric"
                                                    onChangeText={(text) => handleNumericInput("slDVTGoc", text)}
                                                    value={lineForm?.DVTGoc?.toString()}
                                                />
                                            </View>
                                        </FormRow> */}

                    <FormRow label="SL Thực tế:">
                      <TextInput
                        className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-right font-bold text-slate-800"
                        keyboardType="numeric"
                        onChangeText={text =>
                          handleNumericInput('luongThucTe', text)
                        }
                        value={lineForm?.luongThucTe?.toString()}
                      />
                    </FormRow>
                    {/* <FormRow label="SL M2:">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-right font-bold text-slate-800"
                                                keyboardType="numeric"
                                                onChangeText={(text) => handleNumericInput("slM2", text)}
                                                value={lineForm?.slM2?.toString()}
                                            />
                                        </FormRow> */}

                    {/* <FormRow label="Công đoạn:">
                                            <Pressable
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                onPress={() => {setStateModal(!stateModal)}} >
                                                <Text className="text-gray-800 text-right">
                                                    {lineForm.congDoan ? lineForm.congDoan : stateValue ? stateValue.dienGiai : "Chọn công đoạn"}
                                                </Text>
                                            </Pressable> 
                                        </FormRow>

                                        <FormRow label="Mã Kho:">
                                            <Pressable
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                onPress={() => setWarehouseModal(true)}
                                            >
                                                <Text className={lineForm.maKho ? "text-black text-right" : "text-gray-400 text-right"}>
                                                    {lineForm.maKho || "Chọn kho"}
                                                </Text>
                                            </Pressable>
                                        </FormRow>

                                        <View className="mb-4">
                                            <View className="flex-row justify-between mb-2">
                                                <Text className="text-slate-600 font-medium">Ghi chú:</Text>
                                                <Text className={`text-xs ${(lineForm?.ghiChu?.length ?? 0) >= 255 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                                    {(lineForm?.ghiChu?.length ?? 0)}/255
                                                </Text>
                                            </View>
                                            
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-800 h-20"
                                                multiline
                                                textAlignVertical="top"
                                                onChangeText={(text) => handleChangeFormLine("ghiChu", text)}
                                                value={lineForm.ghiChu}
                                                maxLength={255} // 🌟 THÊM DÒNG NÀY: Khóa không cho nhập quá 255 ký tự
                                            />
                                        </View> */}
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Footer */}
            <View className="flex-row justify-between p-5 border-t border-slate-100 bg-slate-50">
              <Pressable
                onPress={handleCancel}
                className="bg-red-500 py-3 rounded-md w-[45%] active:opacity-70">
                <Text className="text-white font-bold text-center">Hủy</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="bg-emerald-600 py-3 rounded-md w-[45%] active:opacity-70">
                <Text className="text-white font-bold text-center">Lưu</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {/* {warehouseModal && (
                    <WarehouseModal
                        handleOpenWarehouseModal={() => setWarehouseModal(false)}
                        open={warehouseModal}
                        warehouseList={props.listWarehouses || []}
                        handleGetWarehouse={(w) => {
                            setLineForm(p => ({ ...p, maKho: w.maKho }));
                            setWarehouseModal(false);
                        }}
                    />
                )}
                {stateModal && (
                    <StateModalList
                        data={props.listStates || []}
                        handleOpenStateModalList={() => setStateModal(!stateModal)}
                        onSubmit={handleGetValueFromStateModal}
                        open={stateModal}
                        title="Chọn công đoạn"
                    />
                )} */}
        {/* Modal TP/BTP */}
        {/* <ProductSemiProductModal data={productSemiProduct} handleGetValue={handleGetProductSemiProductFromModal} handleProductSemiProductModal={handleModalProductSemiProduct} open={productSemiProductModal} /> */}
        {/* Modal chọn Ngày */}
        {/* <DatePicker modal mode="date" open={openDate} date={dateSx} locale="vi" onConfirm={(date) => { setOpenDate(false); setDateSx(date); }} title={'Thời gian sản xuất'} onCancel={() => setOpenDate(false)} /> */}
        {/* Modal chọn Giờ */}
        {/* <DatePicker modal mode="time" open={openTime} date={dateSx} locale="vi" is24hourSource="device" title={'Chọn giờ sản xuất'} onConfirm={(date) => { setOpenTime(false); setDateSx(date); }} onCancel={() => { setOpenTime(false); }} /> */}
      </Modal>
    </CameraScannerWrapper>
  );
};

export default LineModalInput;
