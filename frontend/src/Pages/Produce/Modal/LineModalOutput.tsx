import React, { useEffect, useState } from "react";
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
} from "react-native";
import { device, formatDate, formatStringUpcase, formatTime } from "../../../ults";
import { faAdd, faCamera, faCopy, faGear, faPrint, faQrcode, faSave, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { getApi, postApi } from "../../../Base/api/api_service";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Toast from "react-native-toast-message";
import { ProductSemiProductType, CoronaType, LaneType, MachineType, StaffType, ProduceLineForm, StateType } from "../type";
import ProductSemiProductModal from "./ProductSemiProductModal";
import DatePicker from 'react-native-date-picker';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { settingStore } from "../../../Store/settingStore";
import { useNavigation } from "@react-navigation/native";
import CameraScannerWrapper from "../../../Base/CameraScannerWrapper/CameraScannerWrapper";
import { loadingStore } from "../../../Store/loadingStore";
import { AppColors } from "../../../../colors";
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
    khoTKCat: number;
    setStatusLine: (status: string) => void;
    stateValue: StateType;
    // maCD: string;
    // machines: MachineType[];
};

// Component phụ để giao diện đồng bộ
const FormRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
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
        lsx,
        stateValue,
        // khoTKCat,
        setStatusLine
    } = props;
    const setLoadingAtom = useSetRecoilState(loadingStore);

    const navigate = useNavigation();
    const [settings, setSettings] = useRecoilState(settingStore);
    // CHỈ DÙNG 1 STATE DUY NHẤT CHO FORM
    const [lineForm, setLineForm] = useState<ProduceLineForm>(data);
    const [loading, setLoading] = useState(false);

    // const [machines, setMachines] = useState<MachineType[]>([]);
    // const [machineValue, setMachineValue] = useState<MachineType>({ maThietBi: "", tenThietBi: "Vui lòng chọn" });
    // const [machinesModal, setMachinesModal] = useState(false);
    const [productSemiProductValue, setProductSemiProductValue] = useState<ProductSemiProductType>({ dvt: "", maTP: "", tenVatTu: "" });
    // const [nvsxValue, setNvsxValue] = useState<StaffType>({ maNV: '', tenBoPhan: '', tenNV: 'Vui lòng chọn' });
    // const [nvKiemValue, setNvKiemValue] = useState<StaffType>({ maNV: '', tenBoPhan: '', tenNV: 'Vui lòng chọn' });
    // const [modalNvsx, setModalNvsx] = useState(false);
    // const [nvsx, setNvsx] = useState<StaffType[]>([]);
    // const [typeNV, setTypeNV] = useState('SX');
    // const [corona, setCorona] = useState<CoronaType>({ value: 'Chọn mặt corona' });
    // const [coronaModal, setCoronaModal] = useState(false);
    // const [modalLane, setModalLane] = useState(false);
    const [productSemiProduct, setProductSemiProduct] = useState<ProductSemiProductType[]>([]);
    const [productSemiProductModal, setProductSemiProductModal] = useState(false);
    const [dateSx, setDateSx] = useState(new Date());
    const [openDate, setOpenDate] = useState(false);
    const [openTime, setOpenTime] = useState(false);
    const [DvtGoc, setDvtGoc] = useState('');

    // ✅ Reset dữ liệu khi mở Modal
    useEffect(() => {
        if (open) {
            setLineForm(data);
            console.log("lineForm", productSemiProductValue);
            
            // getMachine();
            setDateSx(new Date(data.ngaySX || new Date()));
            handleGetProductSemiProduct(props.lsx);
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
        setLineForm(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // 1. Log trạng thái để kiểm soát logic (theo yêu cầu của bạn)
        // console.log(">>> ID hiện tại của dòng (data.id):", data.id);
        // 2. Danh sách kiểm tra bẫy lỗi (Validation)
        const validations = [
            // { condition: !lineForm?.maNVL, message: 'Vui lòng quét NVL' },
            { condition: !lineForm?.maBTP_TP, message: 'Vui lòng chọn BTP/Thành phẩm' },
            { condition: !lineForm.slDVTGoc || lineForm.slDVTGoc <= 0, message: 'Số lượng gốc phải lớn hơn 0' },
            // { condition: !machineValue?.maThietBi, message: 'Vui lòng chọn Máy sản xuất' },
            // { condition: !nvsxValue?.maNV, message: 'Vui lòng chọn Nhân viên sản xuất' },
            // { condition: !nvKiemValue?.maNV, message: 'Vui lòng chọn Nhân viên kiểm tra' },
            // { condition: !lineForm.slmd || lineForm.slmd <= 0, message: 'Số lượng mét dài phải lớn hơn 0' },
            // { condition: !lineForm.khoTKCat || lineForm.khoTKCat <= 0, message: 'Khổ thiết kế không hợp lệ' },
            // { condition: !corona.value || corona.value === "Chọn mặt corona", message: 'Vui lòng chọn mặt Corona' },
        ];

        for (const validation of validations) {
            if (validation.condition) {
                Toast.show({
                    type: 'error',
                    text1: 'Thiếu thông tin',
                    text2: validation.message
                });
                return;
            }
        }

        // 3. Xử lý thời gian (Bù múi giờ +7 nếu server yêu cầu)
        const dateSxObject = new Date(dateSx);
        const finalDateSx = new Date(dateSxObject.getTime() + (7 * 60 * 60 * 1000));

        // 4. CHÍNH: Bẫy ID dựa trên trạng thái (status)
        // Nếu là NEW thì ép về 0 để API tự gen, nếu EDIT thì giữ nguyên ID cũ từ data props
        const finalId = status === 'NEW' ? 0 : (data.id || 0);

        // 5. Gom dữ liệu gửi đi (Mapping)
        const payload = {
            ...lineForm, // Lấy các giá trị input hiện tại
            id: finalId, // Áp dụng ID đã bẫy
            // maMay: machineValue.maThietBi,
            // soLane: formatStringUpcase(lineForm.soLane || ""),
            // matCorona: corona.value,
            maBTP_TP: productSemiProductValue.maTP || lineForm.maBTP_TP,
            // nvSanXuat: nvsxValue.maNV,
            // nvKiem: nvKiemValue.maNV,
            // slM2: parseFloat((lineForm.slmd * (lineForm.khoTKCat / 1000)).toFixed(3)),
            khoTKCat: lineForm.khoTKCat || 0,
            slM2: lineForm.slM2,
            ngaySX: finalDateSx,
            gioSX: formatTime(dateSx),
            // soLo: status === 'NEW' ? "" : (data.soLo || ""), // Giữ số lô cũ nếu là sửa
            soLo: lineForm.soLo || "", // Giữ số lô cũ nếu là sửa
            matHanDan: lineForm.matHanDan || "",
            soMoiNoi: lineForm.soMoiNoi || 0,   
            slKgNet: lineForm.slKgNet || 0,
            slKgGross: lineForm.slKgGross || 0,
            slmd: lineForm.slmd || 0,
            slDVTGoc: lineForm.slDVTGoc || 0,
        };

        console.log(">>> Dữ liệu cuối cùng gửi đi:", payload);
// return
        // 6. Thực thi
        try {
            onSubmit(payload); // Gửi về detail.tsx

            // Quan trọng: Không nên setStatusLine('NEW') ở đây nếu chưa chắc chắn 
            // hãy để detail.tsx tự quản lý sau khi lưu toàn bộ phiếu.

            handleOpenLineModal(); // Đóng modal

            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: status === 'NEW' ? 'Đã thêm dòng' : 'Đã cập nhật dòng'
            });
        } catch (error) {
            console.error("Lỗi thực thi handleSave:", error);
        }
    };

    const handleNumericInput = (key: string, text: string) => {
        const decimalRegex = /^-?\d*\.?\d*$/;
        if (decimalRegex.test(text)) {
            setLineForm(prev => ({ ...prev, [key]: text }));
        } else {
            console.warn('Giá trị nhập không hợp lệ:', text);
        }
    };

    // const getMachine = async () => {
    //     setLoading(true);
    //     try {
    //         const item = await getApi(
    //             `/machines/GetMachinesByLSX/lsx=${lsx}/maVatTu=${stateValue.maVatTu}/version=${stateValue.version}/congDoan=${stateValue.congDoan}`,
    //             {}
    //         );
    //         if (item && item.length > 0) {
    //             setMachines(item);
    //             setLineForm((prevValues: ProduceLineForm) => ({
    //                 ...prevValues,
    //                 khoTKCat: khoTKCat,
    //             }));
    //             if (status !== 'NEW') {
    //                 const selectedMachine = item.find((machine: MachineType) => machine.maThietBi === lineForm.maMay);
    //                 if (selectedMachine) setMachineValue(selectedMachine);
    //             }
    //         } else {
    //             Toast.show({ type: "error", text1: "Lỗi", text2: "Không tìm thấy sản phẩm" });
    //         }
    //     } catch (error) {
    //         console.error("Error fetching data:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const getDvtGoc = async (maVT: string) => {
        setLoading(true);
        try {
            const item = await getApi(`/produce/getDVTgoc/${stateValue.maVatTu}`, {});
            if (item) setDvtGoc(item.dvTgoc);
            else Toast.show({ type: "error", text1: "Lỗi", text2: "Không tìm thấy DVT gốc" });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setStatusLine('NEW');
        handleOpenLineModal();
    };

    // const handleOpenMachineModal = () => setMachinesModal(!machinesModal);
    // const onSubmitMachine = (machine: MachineType) => {
    //     setMachineValue(machine);
    //     handleChangeFormLine('maMay', machine.maThietBi);
    //     handleOpenMachineModal();
    // };
    // const handleModalNvsx = () => setModalNvsx(!modalNvsx);
    const handleModalProductSemiProduct = () => setProductSemiProductModal(!productSemiProductModal);

    const handleGetProductSemiProduct = async (currentLsx: string) => {
        setLoading(true);
        try {
            const item = await getApi(`/produce/getThanhPham/${currentLsx}`, {});
            if (item) {
                setProductSemiProduct(item);
                // console.log("getThanhPham", item);
                setLineForm((prevValues: ProduceLineForm) => ({
                    ...prevValues,
                    maBTP_TP: item[0].maTP, // Mặc định chọn BTP/TP đầu tiên trong danh sách
                }));
                setDvtGoc(item[0].dvt); // Cập nhật ĐVT gốc tương ứng với BTP/TP đầu tiên
                
            }
        } finally { setLoading(false); }
    };

    // const handleGetNVSX = async () => {
    //     setLoading(true);
    //     const param = { LaPhanXuong: "", TenNV: "", TenBoPhan: "", MaNV: "", PageNumber: 1, PageSize: 999 };
    //     postApi(`/produce/getNVSX`, param, (err: any, resp: any) => {
    //         setLoading(false);
    //         if (!err) {
    //             const itemSX = resp.find((value: StaffType) => value.maNV === lineForm.nvSanXuat);
    //             const itemKiem = resp.find((value: StaffType) => value.maNV === lineForm.nvKiem);
    //             setNvsxValue(itemSX);
    //             setNvKiemValue(itemKiem);
    //             setNvsx(resp);
    //         } else {
    //             Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tìm thấy người dùng' });
    //         }
    //     });
    // };

    // const handleNvModal = (type: string) => {
    //     setTypeNV(type);
    //     handleModalNvsx();
    // };

    // const handleGetNvsxFromModal = (item: StaffType) => {
    //     if (typeNV === 'SX') {
    //         setNvsxValue(item);
    //         handleChangeFormLine('nvSanXuat', item.maNV); // ✅ Gán vào lineForm
    //     } else {
    //         setNvKiemValue(item);
    //         handleChangeFormLine('nvKiem', item.maNV); // ✅ Gán vào lineForm
    //     }
    //     setModalNvsx(!modalNvsx);
    // };

    const handleGetProductSemiProductFromModal = (item: ProductSemiProductType) => {
        setProductSemiProductValue(item);
        handleChangeFormLine('maBTP_TP', item.maTP);
        getDvtGoc(item.maTP);
        setProductSemiProductModal(!productSemiProductModal);
    };

    // const handleGetCoronaValue = (item: CoronaType) => {
    //     setCorona(item);
    //     handleChangeFormLine('matCorona', item.value); // ✅ Gán vào lineForm
    //     setCoronaModal(!coronaModal);
    // };

    // const handleCoronaModal = () => setCoronaModal(!coronaModal);

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
                [field]: value
            };
        });
    };

    // const handleQRCodeScanned = (scannedQRCode: string) => {
    //     const scannedQRCodeTrim = scannedQRCode.trim();
    //     console.log('🔍 Scanned QR Code:', scannedQRCodeTrim);

    //     // QR code chỉ chứa NVL (không split với #)
    //     setForm((prev) => ({
    //         ...prev,
    //         MaNVL: scannedQRCodeTrim
    //     }));
    // };

    // ✅ Xử lý QR Scan - Cập nhật trực tiếp vào lineForm
    const handleQRCodeScanned = (code: string) => {
        const trimmedCode = code.trim();
        console.log('🔍 Scanned QR Code:', trimmedCode);
        // Sử dụng split để tách chuỗi tại vị trí dấu # đầu tiên
        const [maNVL, soLo] = trimmedCode.split('#');

        console.log('📦 Tách chuỗi thành công:', { maNVL, soLo });

        // Cập nhật giá trị vào form dòng (lineForm)
        handleChangeFormLine('maNVL', maNVL || "");
        handleChangeFormLine('soLo', soLo || ""); // Nếu không có ký tự sau dấu #, trả về chuỗi rỗng
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
            qrCode: ''
        }));
        navigate.reset({
            index: 0,
            routes: [{ name: 'InputDetailProduce' as never }],  // Tên của route hiện tại
        });
    };

    const handleScanResult = (qrData: string) => {
        console.log("🔍 QR Code Data from Camera:", qrData);
        handleQRCodeScanned(qrData);
        setShowCameraModal(false);
    };

    return (
        <CameraScannerWrapper
            openModal={showCameraModal}
            handleModal={setShowCameraModal}
            onGetData={handleScanResult}
        >
            <Modal animationType="slide" transparent={true} visible={open}>
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="bg-white rounded-[30px] w-full max-h-[85%] shadow-xl overflow-hidden">
                        {/* Header */}
                        <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
                            <Text className="text-lg font-bold text-slate-800">
                                {status === 'NEW' ? 'Tạo mới' : 'Chỉnh sửa'}
                            </Text>
                            <Pressable onPress={handleCancel} className="p-2 active:bg-slate-50 rounded-full">
                                <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
                            </Pressable>
                        </View>

                        {/* Body */}
                        <View className="p-2">
                            <ScrollView showsVerticalScrollIndicator={false} className="px-3 py-2 h-[450px]">
                                {loading ? (
                                    <View className="py-10"><ActivityIndicator size="large" color={AppColors.primary} /></View>
                                ) : (
                                    <View className="pb-10">
                                        {/* <FormRow label="Ngày:">
                                            <Text className="text-slate-800 font-bold text-right py-2">
                                                {formatDate(lineForm.gio ? new Date(lineForm.gio) : new Date())}
                                            </Text>
                                        </FormRow> */}

                                        {productSemiProduct.length > 0 && (
                                            <>
                                                <FormRow label="BTP/Tp:">
                                                    <Pressable onPress={handleModalProductSemiProduct} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                        <Text className="text-slate-800 text-right" numberOfLines={1}>
                                                            { lineForm?.maBTP_TP ? lineForm?.maBTP_TP :  productSemiProductValue?.tenVatTu}
                                                        </Text>
                                                    </Pressable>
                                                </FormRow>
                                            </>
                                        )}
                                        {DvtGoc && (
                                            <FormRow label="ĐVT Gốc:">
                                                <Text className="text-slate-800 font-bold text-right pr-2">{DvtGoc || ''}</Text>
                                            </FormRow>
                                        )}
                                        <FormRow label="Khổ TK/Cắt:">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                keyboardType="numeric"
                                                onChangeText={(text) => handleChangeFormLine("khoTKCat", text)}
                                                value={lineForm.khoTKCat.toString()}
                                            />
                                        </FormRow>

                                        <FormRow label="SL MD:">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                keyboardType="numeric"
                                                onChangeText={(text) => handleNumericInput("slmd", text)}
                                                value={lineForm.slmd.toString()}
                                            />
                                        </FormRow>

                                        <FormRow label="Số Kg (Net):">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                keyboardType="numeric"
                                                onChangeText={(text) => handleNumericInput("slKgNet", text)}
                                                value={lineForm.slKgNet.toString()}
                                            />
                                        </FormRow>

                                        <FormRow label="SL KG (Gross):">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                keyboardType="numeric"
                                                onChangeText={(text) => handleNumericInput("slKgGross", text)}
                                                value={lineForm.slKgGross.toString()}
                                            />
                                        </FormRow>

                                        <FormRow label={`SL ĐVT gốc ${DvtGoc ? "(" + DvtGoc + ")" : ""}:`}>
                                            <View className="flex-row items-center border border-slate-200 rounded-xl bg-slate-50">
                                                <Text className="text-red-500 absolute left-2 z-10">*</Text>
                                                <TextInput
                                                    className="flex-1 p-3 text-right font-bold text-slate-800"
                                                    keyboardType="numeric"
                                                    onChangeText={(text) => handleNumericInput("slDVTGoc", text)}
                                                    value={lineForm?.slDVTGoc !== undefined ? lineForm.slDVTGoc.toString() : ""}
                                                />
                                            </View>
                                        </FormRow>

                                        {/* <View className="flex-row justify-between items-center bg-cyan-50 p-4 rounded-2xl mb-4 border border-cyan-100">
                                            <Text className="text-cyan-800 font-bold">SL M2:</Text>
                                            <Text className="text-cyan-800 font-black text-lg">
                                                {(lineForm.slmd * lineForm.khoTKCat / 1000).toFixed(3)}
                                            </Text>
                                        </View> */}

                                        <FormRow label="SL M2:">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                keyboardType="numeric"
                                                onChangeText={(text) => handleNumericInput("slM2", text)}
                                                value={lineForm.slM2.toString()}
                                            />
                                        </FormRow>

                                        {/* <FormRow label="Mã máy:">
                                            <Pressable onPress={handleOpenMachineModal} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                <Text className="text-slate-800 text-right" numberOfLines={1}>
                                                    {machineValue?.tenThietBi || ''}
                                                </Text>
                                            </Pressable>
                                        </FormRow>

                                        <FormRow label="Lane:">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right font-bold text-slate-800"
                                                onChangeText={(text) => handleChangeFormLine("soLane", text)}
                                                value={formatStringUpcase(lineForm.soLane.toString())}
                                            />
                                        </FormRow>

                                        <FormRow label="NVSX:">
                                            <Pressable onPress={() => handleNvModal('SX')} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                { lineForm?.nvSanXuat ? 
                                                 (<Text className="text-slate-800 text-right">{lineForm.nvSanXuat}</Text>) 
                                                 : <Text className="text-slate-800 text-right">{nvsxValue ? nvsxValue.tenNV : 'Chọn NV'}</Text> }
                                            </Pressable>
                                        </FormRow>

                                        <FormRow label="NV Kiểm:">
                                            <Pressable onPress={() => handleNvModal('K')} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                { lineForm?.nvKiem ? 
                                                 (<Text className="text-slate-800 text-right">{lineForm.nvKiem}</Text>) 
                                                 : <Text className="text-slate-800 text-right">{nvKiemValue ? nvKiemValue.tenNV : 'Chọn NV'}</Text> }
                                            </Pressable>
                                        </FormRow> */}

                                        {/* <FormRow label="Corona:">
                                            <Pressable onPress={handleCoronaModal} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                <Text className="text-slate-800 text-right">{corona ? corona.value : 'Chọn Corona'}</Text>
                                            </Pressable>
                                        </FormRow> */}

                                        {/* <FormRow label="Mặt hàn dán:">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right text-slate-800"
                                                onChangeText={(text) => handleChangeFormLine("matHanDan", text)}
                                                value={lineForm.matHanDan.toString()}
                                            />
                                        </FormRow> */}

                                        {/* <FormRow label="Số mối nối:">
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-right text-slate-800"
                                                keyboardType="numeric"
                                                onChangeText={(text) => handleChangeFormLine("soMoiNoi", text)}
                                                value={lineForm.soMoiNoi.toString()}
                                            />
                                        </FormRow> */}

                                        {/* <FormRow label="Ngày sản xuất:">
                                            <Pressable onPress={() => setOpenDate(true)} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                <Text className="text-slate-800 text-right font-bold">{formatDate(dateSx)}</Text>
                                            </Pressable>
                                        </FormRow>

                                        <FormRow label="Giờ sản xuất:">
                                            <Pressable onPress={() => setOpenTime(true)} className="border border-slate-200 rounded-xl p-3 bg-slate-50 active:bg-slate-100">
                                                <Text className="text-slate-800 text-right font-bold">{formatTime(dateSx)}</Text>
                                            </Pressable>
                                        </FormRow> */}
                                        {/* <FormRow label="Giờ sản xuất:">
                                            <Text className="text-slate-800 font-bold text-right p-2">{formatTime(dateSx)}</Text>
                                        </FormRow> */}

                                        {/* <View className="mb-4">
                                            <Text className="text-slate-600 font-medium mb-2">Ghi chú:</Text>
                                            <TextInput
                                                className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-800 h-20"
                                                multiline
                                                textAlignVertical="top"
                                                onChangeText={(text) => handleChangeFormLine("ghiChu", text)}
                                                value={lineForm.ghiChu}
                                            />
                                        </View> */}

                                        <View className="mb-4">
                                            <View className="flex-row justify-between mb-2">
                                                <Text className="text-slate-600 font-medium">Ghi chú:</Text>
                                                {/* Hiển thị số ký tự hiện tại / 255 */}
                                                <Text className={`text-xs ${(lineForm.ghiChu?.length ?? 0) >= 255 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                                    {(lineForm.ghiChu?.length ?? 0)}/255
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
                                        </View>
                                    </View>
                                )}
                                {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                                    {JSON.stringify(lineForm, null, 2)}
                                </Text> */}
                            </ScrollView>
                        </View>


                        {/* Footer */}
                        <View className="flex-row justify-between p-5 border-t border-slate-100 bg-slate-50">
                            <Pressable onPress={handleCancel} className="bg-red-500 py-3 rounded-md w-[45%] active:opacity-70">
                                <Text className="text-white font-bold text-center">Hủy</Text>
                            </Pressable>
                            <Pressable onPress={handleSave} className="bg-emerald-600 py-3 rounded-md w-[45%] active:opacity-70">
                                <Text className="text-white font-bold text-center">Lưu</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Modal TP/BTP */}
                <ProductSemiProductModal data={productSemiProduct} handleGetValue={handleGetProductSemiProductFromModal} handleProductSemiProductModal={handleModalProductSemiProduct} open={productSemiProductModal} />
                {/* Modal chọn Ngày */}
                <DatePicker modal mode="date" open={openDate} date={dateSx} locale="vi" onConfirm={(date) => { setOpenDate(false); setDateSx(date); }} title={'Thời gian sản xuất'} onCancel={() => setOpenDate(false)} />
                {/* Modal chọn Giờ */}
                <DatePicker modal mode="time" open={openTime} date={dateSx} locale="vi" is24hourSource="device" title={'Chọn giờ sản xuất'} onConfirm={(date) => { setOpenTime(false); setDateSx(date); }} onCancel={() => { setOpenTime(false); }} />
            </Modal></CameraScannerWrapper >
    );
};

export default LineModalInput;