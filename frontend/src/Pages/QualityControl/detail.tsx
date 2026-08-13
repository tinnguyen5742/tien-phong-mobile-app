import {
  faAdd,
  faTrash,
  faSave,
  faXmark,
  faCamera,
  faRotateRight,
  faQrcode,
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
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {useNavigation} from '@react-navigation/native';
import {loadingStore} from '../../Store/loadingStore';
import {formatDate, combineDateWithCurrentTime} from '../../ults';
import {AppColors} from '../../../colors';
import {getApi, postApi, postImgApi} from '../../Base/api/api_service';
import CameraScannerWrapper from '../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {getSettingValue} from '../Login/store/asyncUserStorage';
import {settingStore} from '../../Store/settingStore'; // Đã sửa tên file theo đúng thực tế settngStore
import GeneralTable, {TableColumn} from '../../Components/GeneralTable';
import StateModalList from './Modal/StateModal';
import ResultModal from './Modal/ResultModal';
import InspectionStandardModalList from './Modal/InspectionStandardModal';
import DatePicker from 'react-native-date-picker';
import QCTypeModal from './Modal/QCTypeModal';

// Import Type và Store theo tên mới của bạn
import {
  TypeFormQualityControl,
  LineFormQualityControl,
  StateType,
  InspectionStandardType,
  QualityControlTypeModal,
} from './type';
import {
  QualityControlStatusTypeAtom,
  QualityControlDetailAtom,
  QualityControlDetailID,
} from './store';
import ImageInput from '../../Components/ImageUpload';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const DetailQualityControl = () => {
  const [typeQualityControlAtom, setTypeQualityControlAtom] = useRecoilState(
    QualityControlStatusTypeAtom,
  );
  const navigate = useNavigation();
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const statusTypeValue = useRecoilValue(QualityControlStatusTypeAtom);
  const qualityControlDetailID = useRecoilValue(QualityControlDetailID);
  const [settings, setSettings] = useRecoilState(settingStore);
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
  // State kiểm soát hiển thị
  const [isScanned, setIsScanned] = useState(false);
  const [stateModal, setStateModal] = useState(false);
  const [state, setState] = useState<StateType[]>([]);
  const [inspectionStandardModal, setInspectionStandardModal] = useState(false);
  const [chuanKiem, setChuanKiem] = useState<InspectionStandardType[]>([]);
  const [showCongDoan, setShowCongDoan] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [dateQualityControl, setDateQualityControl] = useState(new Date());
  const [qualityControlTypeModal, setQualityControlTypeModal] = useState(false);
  const [lineValues, setLineValues] = useState<LineFormQualityControl[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  // Khởi tạo Form
  const [formValues, setFormValues] = useState<TypeFormQualityControl>({
    ngayKiem: new Date().toISOString(),
    gioKiem: new Date().toISOString(),
    tinhTrang: 'draft',
    soLot: '',
    CongDoan: '',
  } as TypeFormQualityControl);

  const [chuanKiemValue, setChuanKiemValue] = useState<InspectionStandardType>(
    {} as InspectionStandardType,
  );

  const [stateValue, setStateValue] = useState<StateType>({
    dienGiai: 'Chọn công đoạn',
  } as StateType);

  const [currentLineForm, setCurrentLineForm] =
    useState<LineFormQualityControl>({} as LineFormQualityControl);

  const columns: TableColumn[] = [
    {name: 'STT', label: 'STT'},
    {name: 'tenChiTieuCon', label: 'Tên chỉ tiêu', width: 200},
    {name: 'tieuChuan', label: 'Tiêu chuẩn', width: 120},
    {name: 'ketQua', label: 'Kết quả', width: 150},
    {name: 'ketLuanText', label: 'Kết luận', width: 120},
  ];
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'STT',
    'tenChiTieuCon',
    'tieuChuan',
    'ketQua',
    'ketLuanText',
  ]);
  const renderCustomCell = (columnName: string, item: any, index: number) => {
    if (columnName === 'tenChiTieuCon') {
      return (
        <View style={{width: 192}} className="items-start justify-center pl-2">
          <Text className="text-left text-gray-700 font-medium">
            {item.tenChiTieuCon}
          </Text>
        </View>
      );
    }
    if (columnName === 'ketLuanText') {
      return (
        <View className={`px-2 py-1 rounded`}>
          <Text
            className={item.ketLuan == 'D' ? 'text-green-700' : 'text-red-700'}>
            {!item.ketLuan ? '' : item.ketLuan === 'D' ? 'Đạt' : 'K.Đạt'}
            {/* {!formValues?.loaiKiem ? 'Chọn loại kiểm' : formValues.loaiKiem === 'NL' ? 'Nguyên liệu' : 'TP/BTP'} */}
          </Text>
        </View>
      );
    }
    // Các cột mặc định
    return <Text className="text-gray-700">{item[columnName]}</Text>;
  };

  const handleGetQualityControlDetail = async (id: number) => {
    try {
      const url = `/qc/list/one?headerID=${id}`;
      const item = await getApi(url, {});
      console.log('handleGetQualityControlDetail: ', item);
      if (item?.status === true && item?.data) {
        setFormValues(item.data);
        setLineValues(item.data.lines || []);
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
    if (statusTypeValue === 'EDIT' && qualityControlDetailID) {
      console.log(
        '🚀 Đang ở chế độ EDIT, tiến hành load dữ liệu chi tiết từ Atom BlowingDetailAtom với ID:',
        qualityControlDetailID,
      );
      handleGetQualityControlDetail(qualityControlDetailID);
      if (!formValues.maVatTu) {
        return;
      }
    }
  }, [statusTypeValue, qualityControlDetailID]);

  //   useEffect(() => {
  //     const initEditData = async () => {
  //       if (statusTypeValue === 'EDIT' && detailQualityControlValue) {
  //         console.log('📥 Đang đổ dữ liệu EDIT vào form...');

  //         // 1. Xác định mã vật tư chính xác từ dữ liệu truyền sang
  //         const activeMaVatTu = detailQualityControlValue.maVatTu || '';

  //         // 2. Đổ dữ liệu tổng quan có sẵn vào form trước để user thấy thông tin cơ bản
  //         setFormValues({
  //           ...detailQualityControlValue,
  //           qrCode: activeMaVatTu || detailQualityControlValue.qrCode || '',
  //         });

  //         // Mặc định gán tạm lines từ danh sách (nếu có)
  //         let finalLines = detailQualityControlValue.lines || [];

  //         // 3. 🚀 GỌI API CHI TIẾT để lấy đầy đủ cấu trúc tên chỉ tiêu, tiêu chuẩn (tenChiTieuCon, tieuChuan...)
  //         if (activeMaVatTu) {
  //           try {
  //             const fullQCData = await getQC(activeMaVatTu);
  //             if (fullQCData && fullQCData.lines) {
  //               // Nếu API chi tiết trả về lines đầy đủ chữ hơn, ưu tiên lấy nó
  //               finalLines = fullQCData.lines;
  //             }
  //           } catch (apiError) {
  //             console.error('❌ Lỗi load chi tiết QC khi EDIT:', apiError);
  //           }
  //         }

  //         // 4. Đổ danh sách lưới chỉ tiêu chuẩn cuối cùng vào bảng hiển thị
  //         setLineValues(finalLines);

  //         // 5. Đổ dữ liệu cho component chuẩn kiểm để tránh lỗi rỗng idTaiLieuKn khi bấm Save
  //         setChuanKiemValue({
  //           ...detailQualityControlValue,
  //           lines: finalLines,
  //         } as any);
  //       }
  //     };

  //     initEditData();
  //   }, [statusTypeValue, detailQualityControlValue]);

  useEffect(() => {
    if (statusTypeValue === 'EDIT') {
      // console.log("statusTypeValue", statusTypeValue);
      setIsScanned(true);
    }
  }, [statusTypeValue]);

  useEffect(() => {
    if (formValues?.congDoan?.length > 0) {
      setState(formValues.congDoan);
    }
  }, [formValues.congDoan]);

  useEffect(() => {
    setStateValue({dienGiai: 'Chọn công đoạn'} as StateType);
    setChuanKiemValue({} as InspectionStandardType);
    setLineValues([]);
  }, [formValues.qrCode]);

  useEffect(() => {
    if (formValues?.soPhieu && formValues?.id) {
      getImagesFromHeaderID(formValues.id.toString());
    } else {
      return;
    }
  }, [formValues?.soPhieu && formValues?.id]);

  const handleQualityControlTypeModal = () => {
    setQualityControlTypeModal(!qualityControlTypeModal);
  };

  const handleChangeTypeQualityControl = (value: string) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      loaiKiem: value,
    }));
  };

  const loadSettings = async () => {
    const value = await getSettingValue();
    setSettings({useCameraScan: value});
  };

  const getQC = async (id: string) => {
    setLoadingAtom(true);
    try {
      // Truyền biến currentPage động vào chuỗi API query string
      const api = `/qc/scan/${id}`;
      const item = await getApi(api, {});
      if (item.status && item.data) {
        return item.data;
      } else {
        console.log('Load QC Error');
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoadingAtom(false);
    }
  };

  const getImagesFromHeaderID = async (id: string) => {
    setLoadingAtom(true);
    try {
      // Truyền biến currentPage động vào chuỗi API query string
      const api = `/qc/file/list?headerId=${id}`;
      const item = await getApi(api, {});
      if (item.status && item.data) {
        console.log('📸 Load Images Success: ', item.data);
        setFormValues(prev => ({
          ...prev,
          images: item.data,
        }));
        return item.data;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải hình ảnh',
        });
        console.log('Load Images Error');
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleScanResult = async (qrData: string) => {
    // console.log("🔍 QR Code Data from Camera:", qrData);

    // 1. Kiểm tra chuỗi QR có dữ liệu hay không
    if (qrData) {
      // =========================================================
      // ĐIỀU KIỆN TRÊN CÙNG: KIỂM TRA CHỨA CHỮ 'LSX'
      // =========================================================
      if (qrData.toUpperCase().includes('LSX')) {
        // console.log("🚀 [LSX Detected] Toàn bộ mã QR code là:", qrData);
        setShowCongDoan(true);
        // console.log("🚀 Hiển thị công đoạn khi Qrcode là LSX", showCongDoan);
        const qcData = await getQC(qrData);
        console.log('QC Data', qcData);
        setFormValues(prev => ({
          ...prev,
          LSX: qrData,
          maVatTu: qcData.maVatTu,
          qrCode: qrData,
          congDoan: qcData?.congDoan || [],
          chuanKiem: qcData?.taiLieuKiemNghiem || [],
        }));

        // console.log("formValues: " , formValues);
        // Bạn có thể xử lý thêm logic cho mã LSX ở đây nếu cần thiết
        setIsScanned(true);
        setShowCameraModal(false);
        return; // Thoát hàm luôn, không chạy xuống logic cắt mã vật tư ở dưới
      }
      // 2. Thực hiện tách chuỗi mã vật tư và mã lô bằng dấu '#'
      const parts = qrData.split('#');
      const maVatTu = parts[0] ? parts[0].trim() : '';
      const soLot = parts[1] ? parts[1].trim() : '';
      console.log('soLot scanQRCODE: ', soLot);
      const qcData = await getQC(maVatTu);
      //   console.log('Mã VT scanQRCODE: ', qcData);
      //   return;

      // 4. Tự động cập nhật điền vào form hiện tại
      setFormValues(prev => ({
        ...prev,
        maVatTu: maVatTu,
        LSX: '',
        qrCode: maVatTu,
        soLot: soLot,
        chuanKiem: qcData.taiLieuKiemNghiem || [],
      }));
      setShowCongDoan(false);
      setIsScanned(true);
      setShowCameraModal(false);

      // 5. Thông báo cho người dùng biết đã điền thành công
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `Quét QR code thành công`,
      });
    }

    // 6. Đóng camera sau khi xử lý xong
    setShowCameraModal(false);
  };

  const handleStateModal = () => {
    if (formValues?.LSX !== '') {
      setStateModal(!stateModal);
    } else {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    }
  };

  const handleInspectionStandardModal = () => {
    if (formValues?.chuanKiem) {
      setInspectionStandardModal(!inspectionStandardModal);
    } else {
      Alert.alert('Thông báo', 'Vui lòng quét LSX');
    }
  };

  const handleGetValueFromStateModal = (item: StateType) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      MaCD: item.maCD,
      CongDoan: item.congDoan.toString(),
    }));
    setStateValue(item);
    setChuanKiemValue({
      idTaiLieuKn: '',
      maTaiLieuKiemNghiem: '',
      maVatTu: '',
      tenVatTu: '',
      phienBan: 0,
      ngayKiem: '',
      ghiChu: '',
      chuanKN: '',
      loaiKN: '',
      lines: [],
    });
    setLineValues([]);
  };

  const handleGetValueFromInspectionStandardModal = (
    item: InspectionStandardType,
  ) => {
    setChuanKiemValue(item);
    setFormValues(prev => ({
      ...prev,
      idTaiLieuKn: item?.idTaiLieuKn || '',
    }));
    // console.log('handleGetValueFromInspectionStandardModal', item);
    const currentCongDoan = formValues.MaCD
      ? String(formValues.MaCD).trim()
      : null;

    if (!currentCongDoan) {
      setLineValues(item.lines);
      console.log(`🚀 Line chưa lọc theo công đoạn: `, item.lines);
    } else {
      let _listByState = item.lines.filter((f: any) => {
        return f.congDoan && String(f.congDoan).trim() === currentCongDoan;
      });

      setLineValues(_listByState);
      console.log(
        `🚀 Line sau khi lọc theo công đoạn (${currentCongDoan}): `,
        _listByState,
      );
    }
  };

  const handleEdit = (item: LineFormQualityControl, index: number) => {
    setCurrentLineForm(item);
    setEditIndex(index); // Lưu lại vị trí dòng để tí nữa lưu đè
    setEditLineIndex(index);
    setLineModalOpen(true);
  };

  const handleSubmitLine = (updatedLine: any) => {
    // console.log("Kết quả nhận từ Modal:", updatedLine);
    if (editLineIndex !== null) {
      // ✅ SỬA TẠI ĐÂY: Cập nhật trực tiếp vào mảng lineValues quản lý danh sách bảng
      setLineValues((prevLines: LineFormQualityControl[]) => {
        // 1. Sao chép mảng Lines hiện tại ra một mảng mới để đảm bảo tính bất biến (Immutability)
        const newLines = [...prevLines];
        // 2. Ghi đè chỉ nguyên kết quả (ketQua) vào dòng chỉ tiêu đang chỉnh sửa tại editLineIndex
        newLines[editLineIndex] = {
          ...newLines[editLineIndex],
          ketQua: updatedLine.ketQua || '', // Nhận giá trị 'Đạt' hoặc 'Không đạt' từ Modal
          ketLuan: updatedLine.ketLuan || '', // Nhận giá trị 'Đ' hoặc 'KĐ' từ Modal
          ketLuanText: updatedLine.ketLuanText || '', // Nhận giá trị 'Đ' hoặc 'KĐ' từ Modal
        };
        // console.log("submitLineKetQua: ", newLines[editLineIndex])
        // console.log("🌟 Danh sách Lines sau khi cập nhật thành công:", newLines);
        return newLines;
      });
    }
    // Đóng Modal và giải phóng vị trí index chỉnh sửa
    setLineModalOpen(false);
    setEditLineIndex(null);
    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: `Đã ghi nhận kết luận: ${updatedLine.ketLuanText}`,
    });
  };

  const uploadSingleFile = async (headerId: string | number, imageObj: any) => {
    const fileUri = imageObj.path;
    if (!fileUri) return null;
    // Lấy tên file từ đường dẫn cục bộ
    const fileName = fileUri.split('/').pop() || `qc_image_${Date.now()}.jpg`;
    // Đóng gói dữ liệu chuẩn Multipart Form
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: imageObj.mime || 'image/jpeg',
    } as any);
    const url = `/qc/file/upload/${headerId}`;
    // 🌟 Gọi hàm vừa viết trong utils, truyền trực tiếp formData và version 'v2'
    return await postImgApi(url, formData);
  };

  const handleSaveForm = async (status: string) => {
    if (!formValues.idTaiLieuKn) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn chuẩn kiểm',
      });
      return;
    }
    setLoadingAtom(true);

    const finalNgayKiemStr = combineDateWithCurrentTime(formValues.ngayKiem);
    const submitData = {
      soPhieu: formValues.soPhieu || '',
      idTaiLieuKn: formValues.idTaiLieuKn,
      TinhTrang: status,
      CongDoan: formValues.CongDoan || '',
      LSX: formValues.LSX || '',
      maVatTu: formValues.maVatTu || '',
      ngayKiem: finalNgayKiemStr,
      LoaiKiem: formValues.loaiKiem || '',
      soLot: formValues.soLot || '',
      lines: lineValues.map(line => ({
        idChiTieu: line.idChiTieu,
        ketLuan: line.ketLuan || '',
        // ketLuanText: line.ketLuanText || "",
        ketQua: line.ketQua || '',
        congDoan: formValues.CongDoan || '',
      })),
    };
    console.log('submitData: ', submitData);
    // setLoadingAtom(false);
    // return
    try {
      const url = `/qc/evaluate`;
      const resp = await postApi(url, submitData);
      // console.log("🔴 Kiểm tra phản hồi API thành công - Resp:", resp);
      if (resp && (resp.success || resp.status || resp.data)) {
        // Upload images
        const headerId = resp.data?.id || resp.id || resp.data;
        if (headerId && uploadedImages && uploadedImages.length > 0) {
          console.log(
            `📸 Tìm thấy ${uploadedImages.length} ảnh cần upload cho phiếu ID: ${headerId}`,
          );
          // Bước 2: Chạy vòng lặp đồng bộ tuần tự để upload từng ảnh một bằng cấu trúc Multipart
          for (let i = 0; i < uploadedImages.length; i++) {
            try {
              console.log(
                `🔄 Đang upload ảnh thứ ${i + 1}/${uploadedImages.length}...`,
              );
              await uploadSingleFile(headerId, uploadedImages[i]);
            } catch (uploadErr) {
              // Log lỗi cục bộ của tấm ảnh đó nhưng không làm crash toàn bộ tiến trình
              console.error(
                `❌ Lỗi khi upload tấm ảnh thứ ${i + 1}:`,
                uploadErr,
              );
            }
          }
        }
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
      if (err.status === 400) {
        Toast.show({
          type: 'error',
          text1: 'Tình trạng phiếu đã đóng, không thể lưu!',
        });
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
  //#endregion

  // const handlePreviewImageData = (images: any[]) => {
  //     if (!images || images.length === 0) {
  //         Alert.alert("Thông báo", "Danh sách ảnh hiện tại đang rỗng!");
  //         return;
  //     }

  //     // 1. Tạo chuỗi JSON định dạng thụt lề đẹp (indent 2 khoảng trắng)
  //     const jsonStringData = JSON.stringify(images, null, 2);

  //     // 2. In ra tab Console của Metro Bundler để bạn dễ dàng Copy/Xem trên máy tính
  //     console.log("📸 --- CẤU TRÚC DATA HÌNH ẢNH CỦA BẠN --- 📸");
  //     console.log(jsonStringData);

  //     // 3. Hiển thị hộp thoại Alert ngay trên giao diện App điện thoại để xem trực tiếp
  //     Alert.alert(
  //         "Kiểu dữ liệu hình ảnh",
  //         jsonStringData,
  //         [{ text: "Đóng", style: "cancel" }]
  //     );
  // };

  const insets = useSafeAreaInsets();
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}>
      <View className="flex-1 bg-white" style={{paddingBottom: insets.bottom}}>
        <HeaderComponent
          title="KIỂM NVL/BTP/TP"
          backButton
          handleBack={() => navigate.goBack()}
          iconRight={
            isScanned ? (
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => handleSaveForm('draft')}>
                  <Text className="font-semibold text-accent pr-5">
                    Lưu tạm
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSaveForm('complete')}>
                  <FontAwesomeIcon
                    icon={faSave}
                    size={25}
                    color={AppColors.primary}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        {!isScanned ? (
          <View className="flex-1 items-center justify-center p-6">
            <FontAwesomeIcon icon={faQrcode} size={100} color="#cbd5e1" />
            <TouchableOpacity
              onPress={() => setShowCameraModal(true)}
              className="bg-primary px-10 py-3 rounded-xl mt-6">
              <Text className="text-white font-bold">
                QUÉT MÃ MẪU ĐỂ KIỂM TRA
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView className="flex-1 p-3">
            {/* <Text style={{fontFamily: 'monospace'}} className="text-gray-900">
              {JSON.stringify(formValues, null, 2)}
            </Text> */}
            <View className="bg-gray-50 rounded-xl p-3 pb-1 mb-4 border border-gray-100">
              {/* QR Code hiển thị lại mã đã quét */}
              {statusTypeValue === 'EDIT' && (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium">Số phiếu:</Text>
                  <Text className="text-gray-900 font-bold">
                    {formValues.soPhieu}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center border-b border-gray-200 py-3">
                <Text className="font-bold text-gray-700">QR Code:</Text>
                <View className="flex-row items-center">
                  <Text className="text-cyan-800 font-bold mr-2">
                    {formValues.qrCode}
                  </Text>
                  {statusTypeValue !== 'EDIT' ? (
                    <TouchableOpacity onPress={() => setShowCameraModal(true)}>
                      <FontAwesomeIcon
                        icon={faRotateRight}
                        size={16}
                        color={AppColors.primary}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}
                </View>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Loại kiểm:
                </Text>
                <Pressable
                  onPress={handleQualityControlTypeModal}
                  className="flex-1 bg-white border border-gray-300 rounded-lg h-11 justify-center px-3">
                  <Text
                    className={
                      formValues?.loaiKiem
                        ? 'text-black text-right'
                        : 'text-gray-400 text-right'
                    }>
                    {!formValues?.loaiKiem
                      ? 'Chọn loại kiểm'
                      : formValues.loaiKiem === 'NL'
                      ? 'Nguyên liệu'
                      : 'TP/BTP'}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">Ngày</Text>
                <Pressable
                  onPress={() => setOpenDate(true)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3">
                  <Text className="text-slate-800 text-right font-bold">
                    {formValues?.ngayKiem
                      ? formatDate(new Date(formValues.ngayKiem))
                      : formatDate(new Date())}
                  </Text>
                </Pressable>
              </View>

              {/* Công đoạn Select */}
              {showCongDoan === true ? (
                <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium w-24">
                    Công đoạn
                  </Text>
                  {statusTypeValue !== 'EDIT' ? (
                    <Pressable
                      className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                      onPress={handleStateModal}>
                      <Text className="text-gray-800 text-right">
                        {stateValue.dienGiai ? stateValue.dienGiai : ''}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text className="flex-1 text-gray-800 font-bold pr-2 py-2 text-right">
                      {stateValue.dienGiai ? stateValue.dienGiai : ''}
                    </Text>
                  )}
                </View>
              ) : (
                <View />
              )}

              <View className="flex-row items-center py-2">
                <Text className="text-gray-600 font-medium w-24">
                  Chuẩn kiểm
                </Text>
                {statusTypeValue !== 'EDIT' ? (
                  <Pressable
                    className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                    onPress={handleInspectionStandardModal}>
                    <Text className="text-gray-800 text-right">
                      {chuanKiemValue.chuanKN
                        ? chuanKiemValue.chuanKN
                        : formValues.idTaiLieuKn}
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="flex-1 text-gray-800 font-bold pr-2 py-2 text-right">
                    {formValues.idTaiLieuKn ? formValues.idTaiLieuKn : ''}
                  </Text>
                )}
              </View>
              <View className="mb-2">
                <ImageInput
                  maxImages={6}
                  initialImages={formValues.images || []}
                  onImagesChange={images => setUploadedImages(images)}
                />
              </View>
            </View>

            {/* <TouchableOpacity 
                            onPress={() => handlePreviewImageData(uploadedImages)}
                            className="bg-amber-600 p-3 rounded-xl items-center mt-2 mx-1 active:opacity-80"
                        >
                            <Text className="text-white font-bold">🔍 XEM KIỂU DỮ LIỆU ẢNH (PRE DATA)</Text>
                        </TouchableOpacity> */}

            <View className="flex-row justify-between items-center mb-2 px-1">
              <Text className="text-lg font-bold text-gray-800">
                Lưới chỉ tiêu
              </Text>
            </View>

            <GeneralTable
              data={lineValues}
              columns={columns}
              selectedColumns={selectedColumns}
              onRowPress={(item, index) => handleEdit(item, index)}
              renderCell={renderCustomCell}
            />

            <View className="pb-[30%]"></View>
          </ScrollView>
        )}

        {qualityControlTypeModal && (
          <QCTypeModal
            handleChangeTypeQC={handleChangeTypeQualityControl}
            handleOpenQCType={handleQualityControlTypeModal}
            open={qualityControlTypeModal}
          />
        )}

        {stateModal && (
          <StateModalList
            data={state}
            handleOpenStateModalList={handleStateModal}
            onSubmit={handleGetValueFromStateModal}
            open={stateModal}
            title="Chọn công đoạn"
          />
        )}
        {inspectionStandardModal && (
          <InspectionStandardModalList
            data={(formValues?.chuanKiem || []) as any}
            handleOpenInspectionStandardModalList={
              handleInspectionStandardModal
            }
            onSubmit={handleGetValueFromInspectionStandardModal}
            open={inspectionStandardModal}
            title="Chọn chuẩn kiểm"
          />
        )}
        {lineModalOpen && (
          <ResultModal
            handleResultModal={() => {
              setLineModalOpen(false);
            }}
            open={lineModalOpen}
            onSubmit={handleSubmitLine}
            data={currentLineForm}
          />
        )}
        <DatePicker
          modal
          mode="date"
          open={openDate}
          date={
            formValues?.ngayKiem ? new Date(formValues.ngayKiem) : new Date()
          }
          locale="vi"
          onConfirm={date => {
            setOpenDate(false);
            setDateQualityControl(date);
            setFormValues(prev => ({...prev, ngayKiem: date.toISOString()}));
          }}
          title={'Thời gian kiểm kê'}
          onCancel={() => setOpenDate(false)}
        />
      </View>
    </CameraScannerWrapper>
  );
};

export default DetailQualityControl;
