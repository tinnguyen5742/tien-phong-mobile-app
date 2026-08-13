import {
  faAdd,
  faTrash,
  faSave,
  faXmark,
  faCamera,
  faRotateRight,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import HeaderComponent from "../../Base/HeaderComponent/headerComponent";
import { useNavigation } from "@react-navigation/native";
import { loadingStore } from "../../Store/loadingStore";
import { formatDate, combineDateWithCurrentTime } from "../../ults";
import { AppColors } from "../../../colors";
import { getApi } from "../../Base/api/api_service";
import CameraScannerWrapper from "../../Base/CameraScannerWrapper/CameraScannerWrapper";
import { getSettingValue } from "../Login/store/asyncUserStorage";
import { settingStore } from "../../Store/settingStore";
import GeneralTable, { TableColumn } from "../../Components/GeneralTable";
import DatePicker from "react-native-date-picker";

// Import Type và Store theo tên mới của bạn
import {
  InspectionStandardType,
  TypeFormQCDetail,
  TypeFormQCHeader,
  InspectionTimeType,
  MFNongType,
} from "./type";
import {
  QualityControlStatusTypeAtom,
  QualityControlDetailAtom,
  QualityControlDetailID,
} from "./store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InspectionTimeModalList from "./Modal/InspectionTimeModal";
import MFNongModalList from "./Modal/MFNongModal";
import QCLineModal from "./Modal/QCLineModal";

const DetailQualityControl = () => {
  const navigate = useNavigation();
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const statusTypeValue = useRecoilValue(QualityControlStatusTypeAtom);
  const qualityControlDetailID = useRecoilValue(QualityControlDetailID);
  const [settings, setSettings] = useRecoilState(settingStore);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editLineIndex, setEditLineIndex] = useState<number | null>(null);
  // State kiểm soát hiển thị
  const [isScanned, setIsScanned] = useState(false);
  const [inspectionStandardModal, setInspectionStandardModal] = useState(false);
  const [chuanKiem, setChuanKiem] = useState<InspectionStandardType[]>([]);
  const [showCongDoan, setShowCongDoan] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [dateQualityControl, setDateQualityControl] = useState(new Date());
  const [fieldFocus, setFieldFocus] = useState("");
  // const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  const [formValues, setFormValues] = useState<TypeFormQCHeader>();
  const [lineValues, setLineValues] = useState<TypeFormQCDetail[]>([]);

  const [inspectionTimeModal, setInspectionTimeModal] = useState(false);
  const [inspectionTimeList, setInspectionTimeList] = useState<
    InspectionTimeType[]
  >([]);
  const [mfNongModal, setMFNongModal] = useState(false);
  const [mfNongList, setMFNongList] = useState<MFNongType[]>([]);
  // const [chuanKiemValue, setChuanKiemValue] = useState<InspectionStandardType>(
  //   {} as InspectionStandardType,
  // );

  // const [stateValue, setStateValue] = useState<StateType>({
  //   dienGiai: "Chọn công đoạn",
  // } as StateType);

  const [currentLineForm, setCurrentLineForm] = useState<TypeFormQCDetail>(
    {} as TypeFormQCDetail,
  );

  const columns: TableColumn[] = [
    { name: "No", label: "No" },
    { name: "TestCriteria", label: "TestCriteria", width: 90 },
    { name: "TestCriteriaName", label: "TestCriteriaName", width: 200 },
    { name: "StandardValue", label: "StandardValue", width: 150 },
    { name: "Result", label: "Result", width: 150 },
    { name: "Description", label: "Description", width: 150 },
  ];
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "No",
    "TestCriteria",
    "TestCriteriaName",
    "StandardValue",
    "Result",
    "Description",
  ]);
  const renderCustomCell = (columnName: string, item: any, index: number) => {
    if (columnName === "tenChiTieuCon") {
      return (
        <View
          style={{ width: 192 }}
          className="items-start justify-center pl-2"
        >
          <Text className="text-left text-gray-600 font-medium">
            {item.tenChiTieuCon}
          </Text>
        </View>
      );
    }
    if (columnName === "ketLuanText") {
      return (
        <View className={`px-2 py-1 rounded`}>
          <Text
            className={item.ketLuan == "D" ? "text-green-700" : "text-red-700"}
          >
            {!item.ketLuan ? "" : item.ketLuan === "D" ? "Đạt" : "K.Đạt"}
            {/* {!formValues?.loaiKiem ? 'Chọn loại kiểm' : formValues.loaiKiem === 'NL' ? 'Nguyên liệu' : 'TP/BTP'} */}
          </Text>
        </View>
      );
    }
    // Các cột mặc định
    return <Text className="text-gray-600">{item[columnName]}</Text>;
  };

  const handleGetQualityControlDetail = async (id: string) => {
    try {
      const url = `/APIMobile/ShiftTesting?testinNbr=${id}`;
      const item = await getApi(url, {});
      // console.log("handleGetQualityControlDetail: ", item);
      if (item?.success && item?.data) {
        setFormValues(item.data.Header);
        setLineValues(item.data.Details || []);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "An error occurred. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGetInspectionTimeList = async () => {
    try {
      const url = `/APIMobile/ShiftTestingInspectionTimeMobile`;
      const item = await getApi(url, {});
      // console.log("handleGetInspectionTimeList: ", item);
      if (item?.success && item?.data) {
        setInspectionTimeList(item.data);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "An error occurred. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGetLines = async (id: string) => {
    try {
      const url = `/APIMobile/ShiftTestingLines?inventoryID=${id}`;
      const item = await getApi(url, {});
      // console.log("handleGetInspectionTimeList: ", item);
      if (item?.success && item?.data) {
        setLineValues(item.data);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "An error occurred. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGetMFNongList = async () => {
    try {
      const url = `/APIMobile/ShiftTestingMFNongMobile`;
      const item = await getApi(url, {});
      // console.log("handleGetMFNongList: ", item);
      if (item?.success && item?.data) {
        setMFNongList(item.data);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "An error occurred. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (statusTypeValue === "EDIT" && qualityControlDetailID) {
      console.log(
        "🚀 Đang ở chế độ EDIT, tiến hành load dữ liệu chi tiết từ Atom BlowingDetailAtom với ID:",
        qualityControlDetailID,
      );
      handleGetQualityControlDetail(qualityControlDetailID);
      // if (!formValues.InventoryID) {
      //   return;
      // }
    }
  }, [statusTypeValue, qualityControlDetailID]);

  useEffect(() => {
    if (statusTypeValue === "EDIT") {
      // console.log("statusTypeValue", statusTypeValue);
      setIsScanned(true);
    }
    handleGetInspectionTimeList();
    handleGetMFNongList();
  }, [statusTypeValue]);

  useEffect(() => {
    if (statusTypeValue === "NEW" && formValues?.InventoryID) {
      let _id = formValues.InventoryID.toString();
      handleGetLines(_id);
    }
  }, [statusTypeValue, formValues?.InventoryID]);

  const handleFocus = (fieldIsFocus: string) => {
    setFieldFocus(fieldIsFocus);
  };

  const handleOnChange = (value: any, field: string) => {
    setFormValues((prevValues: any) => {
      return {
        ...prevValues,
        [field]: value,
      };
    });
  };

  const [openModalLineDetail, setOpenModalLineDetail] = useState(false);
  const handleOpenLineModal = () => {
    setOpenModalLineDetail(!openModalLineDetail);
  };

  const handleSaveModalLine = (updatedLine: TypeFormQCDetail) => {
    // Trường hợp 1: Nếu danh sách chi tiết của bạn là Mảng (Details / LineValues)
    setLineValues((prevDetails) =>
      prevDetails.map((item, index) => {
        // Tìm item đang chỉnh sửa dựa vào editIndex hoặc TestingLineID
        if (index === editIndex) {
          return {
            ...item,
            Result: updatedLine.Result,
            Description: updatedLine.Description,
          };
        }
        return item;
      }),
    );

    // Sau khi cập nhật state xong mới đóng Modal và reset index
    setOpenModalLineDetail(false);
    setEditIndex(null);
  };

  const loadSettings = async () => {
    const value = await getSettingValue();
    setSettings({ useCameraScan: value });
  };

  const getQC = async (lsx: string) => {
    setLoadingAtom(true);
    try {
      // Truyền biến currentPage động vào chuỗi API query string
      const api = `/APIMobile/ShiftTestingDiscreteJob?discreteNbr=${lsx}`;
      const item = await getApi(api, {});
      if (item.success && item.data) {
        return item.data;
      } else {
        console.log("Load LSX Error");
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
      const qcData = await getQC(qrData);
      console.log("QC Data", qcData);
      setFormValues((prev) => ({
        ...prev,
        LsxNo: qrData,
        DiscreteID: qcData.DiscreteID,
        DiscreteNbr: qcData.DiscreteNbr,
        LsxReft: qcData.LsxRef,
        InventoryID: qcData.InventoryID,
        InventoryIC: qcData.InventoryIC,
        Uom: qcData.Uom,
        ProductionStandard: qcData.ProductionStandard,
      }));

      setShowCongDoan(true);
      // console.log("🚀 Hiển thị công đoạn khi Qrcode là LSX", showCongDoan);
      setIsScanned(true);
      setShowCameraModal(false);

      // 5. Thông báo cho người dùng biết đã điền thành công
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Quét QR code thành công`,
      });
    }

    // 6. Đóng camera sau khi xử lý xong
    setShowCameraModal(false);
  };

  const handleInspectionTimeModal = () => {
    setInspectionTimeModal(!inspectionTimeModal);
  };

  const handleInspectionStandardModal = () => {
    if (formValues?.Conclude) {
      setInspectionStandardModal(!inspectionStandardModal);
    } else {
      Alert.alert("Thông báo", "Vui lòng quét LSX");
    }
  };

  const handleMFNongModal = () => {
    setMFNongModal(!mfNongModal);
  };

  const handleGetValueFromInspectionTimeModal = (item: InspectionTimeType) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      InspectionTime: item.Code,
    }));
  };

  const handleGetValueFromMFNongModal = (item: MFNongType) => {
    setFormValues((prevValues: any) => ({
      ...prevValues,
      Mfnong: item.MachineID,
      MFNongDerc: item.MachineName,
    }));
  };

  const handleEdit = (item: TypeFormQCDetail, index: number) => {
    setCurrentLineForm(item);
    setEditIndex(index); // Lưu lại vị trí dòng để tí nữa lưu đè
    setEditLineIndex(index);
    setOpenModalLineDetail(true);
  };

  const handleSaveForm = async (status: string) => {
    if (!formValues) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Err",
      });
      return;
    }
    setLoadingAtom(true);

    setLoadingAtom(false);
  };

  const insets = useSafeAreaInsets();
  return (
    <CameraScannerWrapper
      openModal={showCameraModal}
      handleModal={setShowCameraModal}
      onGetData={handleScanResult}
    >
      <View
        className="flex-1 bg-white"
        style={{ paddingBottom: insets.bottom }}
      >
        <HeaderComponent
          title="QA/QC Detail"
          backButton
          handleBack={() => navigate.goBack()}
          iconRight={
            isScanned ? (
              <View className="flex-row items-center pr-2">
                <TouchableOpacity onPress={() => handleSaveForm("complete")}>
                  <FontAwesomeIcon
                    icon={faSave}
                    size={25}
                    color={AppColors.error}
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
              className="bg-primary px-10 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-bold uppercase">
                Scan the QR code
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView className="flex-1 p-3">
            <Text style={{ fontFamily: "monospace" }} className="text-gray-900">
              {JSON.stringify(formValues, null, 2)}
            </Text>
            {/* <Text style={{ fontFamily: "monospace" }} className="text-gray-900">
              {JSON.stringify(lineValues, null, 2)}
            </Text> */}
            <View className="bg-gray-50 rounded-xl p-3 pb-1 mb-4 border border-gray-100">
              {/* QR Code hiển thị lại mã đã quét */}
              {statusTypeValue === "EDIT" && (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                  <Text className="text-gray-600 font-medium">
                    Testing Nbr:
                  </Text>
                  <Text className="text-gray-900 font-bold">
                    {formValues?.TestingNbr}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Testing Date
                </Text>
                <Pressable
                  onPress={() => setOpenDate(true)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                >
                  <Text className="text-slate-800 text-right font-bold">
                    {formValues?.TestingDate
                      ? formatDate(new Date(formValues?.TestingDate))
                      : formatDate(new Date())}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row justify-between items-center border-b border-gray-200 py-3">
                <Text className="font-medium text-gray-600">LSX No:</Text>
                <View className="flex-row items-center">
                  <Text className="text-primary font-bold mr-2">
                    {formValues?.LsxNo}
                  </Text>
                  {statusTypeValue !== "EDIT" ? (
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

              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-600 font-medium">LSX Ref:</Text>
                <Text className="text-gray-900 font-bold">
                  {formValues?.LsxRef}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-600 font-medium">Inventory CD:</Text>
                <Text className="text-gray-900 font-bold">
                  {formValues?.InventoryID}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">UOM:</Text>
                <Text className="text-gray-900 font-bold">
                  {formValues?.Uom}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Production standards:
                </Text>
                <Text className="text-gray-900 font-bold">
                  {formValues?.ProductionStandard}
                </Text>
              </View>

              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Inspection time:
                </Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                  onPress={handleInspectionTimeModal}
                >
                  <Text className="text-gray-800 text-right">
                    {formValues?.InspectionTime
                      ? formValues?.InspectionTime
                      : "Select Inspection Time"}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Test Qty:
                </Text>
                <TextInput
                  className="flex-1 text-right bg-white border border-gray-300 rounded-lg h-11 px-3 text-gray-600"
                  onFocus={() => handleFocus("TestQty")}
                  onChangeText={(text) => handleOnChange(text, "TestQty")}
                  keyboardType="numeric"
                  value={
                    formValues?.TestQty ? formValues.TestQty.toString() : "0"
                  }
                />
              </View>

              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">MF Nong:</Text>
                <Pressable
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 h-11 justify-center px-3"
                  onPress={handleMFNongModal}
                >
                  <Text className="text-gray-800 text-right">
                    {formValues?.MFNongDerc
                      ? formValues?.MFNongDerc
                      : "Select MF Nong"}
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                <Text className="text-gray-600 font-medium w-24">
                  Conclude:
                </Text>

                <View className="flex-1 flex-row justify-end space-x-3">
                  {[
                    { Code: "D", Descr: "Đạt" },
                    { Code: "K", Descr: "Không đạt" },
                  ].map((item) => {
                    const isSelected = formValues?.Conclude === item.Code;

                    return (
                      <Pressable
                        key={item.Code}
                        onPress={() => handleOnChange(item.Code, "Conclude")}
                        className={`flex-row items-center px-4 py-2.5 rounded-lg`}
                      >
                        {/* Vòng tròn Radio Outer */}
                        <View
                          className={`w-4 h-4 rounded-full border items-center justify-center mr-2 ${
                            isSelected
                              ? item.Code === "D"
                                ? "border-emerald-500"
                                : "border-red-500"
                              : "border-gray-400"
                          }`}
                        >
                          {/* Chấm tròn Radio Inner */}
                          {isSelected && (
                            <View
                              className={`w-2 h-2 rounded-full ${
                                item.Code === "D"
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                          )}
                        </View>

                        {/* Nhãn Đạt / Không đạt */}
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected
                              ? item.Code === "D"
                                ? "text-emerald-700"
                                : "text-red-700"
                              : "text-gray-600"
                          }`}
                        >
                          {item.Descr}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row py-2">
                <Text className="text-gray-600 font-medium w-24 mt-2">
                  Description:
                </Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2 min-h-[60px] text-gray-800"
                  onFocus={() => handleFocus("Description")}
                  onChangeText={(text) => handleOnChange(text, "Description")}
                  multiline={true}
                  textAlignVertical="top"
                  value={formValues?.Description}
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-2 px-1">
              <Text className="text-lg font-bold text-gray-800">
                Line Detail
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

        {inspectionTimeModal && (
          <InspectionTimeModalList
            data={inspectionTimeList}
            handleOpenInspectionTimeModalList={handleInspectionTimeModal}
            onSubmit={handleGetValueFromInspectionTimeModal}
            open={inspectionTimeModal}
            title="Select Inspection Time"
          />
        )}
        {mfNongModal && (
          <MFNongModalList
            data={mfNongList}
            handleOpenMFNongModalList={handleMFNongModal}
            onSubmit={handleGetValueFromMFNongModal}
            open={mfNongModal}
            title="Select MF Nong"
          />
        )}
        {openModalLineDetail ? (
          <QCLineModal
            data={currentLineForm}
            handleOpenQCLineModal={handleOpenLineModal}
            onSubmit={handleSaveModalLine}
            open={openModalLineDetail}
            title="Line Detail"
          />
        ) : null}
        <DatePicker
          modal
          mode="date"
          open={openDate}
          date={
            formValues?.TestingDate
              ? new Date(formValues.TestingDate)
              : new Date()
          }
          locale="vi"
          onConfirm={(date) => {
            setOpenDate(false);
            setDateQualityControl(date);
            setFormValues((prev) => ({
              ...prev,
              TestingDate: date.toISOString(),
            }));
          }}
          title={"Testing Date"}
          onCancel={() => setOpenDate(false)}
        />
      </View>
    </CameraScannerWrapper>
  );
};

export default DetailQualityControl;
