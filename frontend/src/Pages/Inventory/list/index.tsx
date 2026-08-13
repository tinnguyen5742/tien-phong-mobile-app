import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraScannerWrapper from '../../../Base/CameraScannerWrapper/CameraScannerWrapper';
import {ListStyles} from './style';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPenToSquare,
  faTrash,
  faChevronLeft,
  faPlus,
  faRightLong,
  faLeftLong,
  faXmark,
  faGear,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import {CustomColor, device, formatDate, formatTime} from '../../../ults';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {DetailInventoryStore, InventoryStore} from '../store/inventoryStore';
import {getApi, postApi} from '../../../Base/api/api_service';
import {userAtom} from '../../Login/store/userAtom';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {loadingStore} from '../../../Store/loadingStore';
import {settingStore} from '../../../Store/settingStore';
import {getSettingValue} from '../../Login/store/asyncUserStorage';
import SettingWarehouseDetail from '../../WareHouse/Modal/SetitngWarehouseModal';
import {LineWarehouseType, WarehouseSubmitType} from '../../WareHouse/type';
import {ListInventoryType} from '../Type/InventoryType';
import {AppColors} from '../../../../colors';

const ListInventory = () => {
  //! recoil
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const [settings, setSettings] = useRecoilState(settingStore);
  const [settingModal, setSettingModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'Vị trí',
    'Mã VT',
    'Tên VT',
    'Số Lô',
    'SLMD',
    'SLKG',
    'Ngày SX',
    'Máy SX',
    'Ca SX',
    'LSX',
    'Tên NCC/KH',
  ]); // Default selected columns
  const [lineIndexItem, setLineIndexItem] = useState(-1);
  const [completeDisable, setCompleteDisable] = useState(false);
  const scrollRef: any = useRef(null);
  const [reloadList, setReloadList] = useState(false);
  const [listInventory, setListInventory] = useState<ListInventoryType[]>([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraField, setCameraField] = useState<string>('');
  const [formSearch, setFormSearch] = useState({
    maLocator: '',
    maQrCuon: '',
  });

  const columns = [
    {name: 'Mã VT', label: 'Mã VT'},
    {name: 'Tên VT', label: 'Tên VT'},
    {name: 'Số Lô', label: 'Số Lô'},
    {name: 'SLMD', label: 'SLMD'},
    {name: 'Vị trí', label: 'Vị trí'},
    {name: 'Ngày SX', label: 'Ngày SX'},
    {name: 'Máy SX', label: 'Máy SX'},
    {name: 'Ca SX', label: 'Ca SX'},
    {name: 'LSX', label: 'LSX'},
    {name: 'Tên NCC/KH', label: 'Tên NCC/KH'},
    {name: 'SLKG', label: 'SLKG'},
  ];

  useEffect(() => {
    handleScrollToItem(lineIndexItem);
  }, [lineIndexItem]);

  const handleScrollToItem = (lineIndexItem: any) => {
    if (scrollRef.current && lineIndexItem >= 0) {
      // Di chuyển đến vị trí của mục trong `ScrollView`
      scrollRef.current.scrollTo({x: 0, y: lineIndexItem * 40, animated: true});
    }
  };

  const navigate = useNavigation();

  const handleBack = () => {
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

  const handleOpenSettingModal = () => {
    setSettingModal(!settingModal);
  };

  const handleScanResult = (qrData: string) => {
    console.log('🔍 QR Code Data from Camera:', qrData, 'Field:', cameraField);
    if (cameraField === 'maLocator') {
      handelInputChange('maLocator', qrData);
    } else if (cameraField === 'maQrCuon') {
      handelInputChange('maQrCuon', qrData);
    }
    setShowCameraModal(false);
    setCameraField('');
  };
  const handelInputChange = (fieldName: string, text: string) => {
    setFormSearch(prevValues => ({
      ...prevValues,
      [fieldName]: text,
    }));
    handleGetList(text);
  };
  const handelFocusInput = (fieldName: string) => {
    setFormSearch(prevValues => ({
      ...prevValues,
      [fieldName]: '',
    }));
  };
  const handleGetList = (qrcode: string) => {
    if (qrcode.includes('#')) {
      const [MaVatTu, SoLo] = qrcode.split('#');
      console.log('MaVatTu:', MaVatTu); // Kết quả phần trước dấu #
      console.log('SoLo:', SoLo); // Kết quả phần sau dấu #
      handleGetListWithQrCode(MaVatTu, SoLo);
    } else {
      console.log('No # in qrcode:', qrcode);
      // Xử lý khi không có dấu #
      handleGetListWithLocator(qrcode);
    }
    Keyboard.dismiss();
  };

  const handleShowList = (list: ListInventoryType[]) => {
    setListInventory(list);
  };
  const handleGetListWithLocator = async (maLocator: string) => {
    setLoadingAtom(true);
    try {
      const url = `/inventory/getLocator/${maLocator}`;
      const item = await getApi(url, {}, 'v1');
      if (item.status) {
        console.log('item: ', item);
        handleShowList(item.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy sản phẩm',
        });
        // setBoPhanModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Đường dẫn bị sai, vui lòng báo kĩ thuật',
        });
      }
    } finally {
      setLoadingAtom(false);
    }
  };
  const handleGetListWithQrCode = async (MaVatTu: string, SoLo: string) => {
    setLoadingAtom(true);

    // postApi('/inventory/getItem', { MaVatTu: MaVatTu, SoLo: SoLo  }, (err: any, resp: any) => {
    //     if (!err) {
    //         setLoadingAtom(false);
    //         console.log('resp: ', resp);
    //         handleShowList(resp.data);
    //     } else {
    //         console.error('Error saving data:', err);
    //         // Hiển thị lỗi khi API thất bại
    //         Toast.show({
    //             type: 'error',
    //             text1: 'Lỗi',
    //             text2: 'Lưu phiếu thất bại'
    //         });
    //         setLoadingAtom(false);
    //     }
    // });
  };
  const columnWidths = {
    stt: 50,
    viTri: 80,
    maVT: 100,
    tenVT: 160,
    soLo: 100,
    slMD: 70,
    slKG: 70,
    ngaySX: 100,
    maySX: 100,
    caSX: 80,
    lsx: 100,
    ncC_KH: 250,
  };
  const generalTable = (data: any) => {
    let rows: any = [];
    console.log('Selected Columns:', selectedColumns);

    if (data) {
      data.map((value: ListInventoryType, key: number) => {
        // console.log("🚀 ~ file: index.js:71 ~ data.map ~ value:", value);
        rows.push(
          <TouchableOpacity
            key={key}
            style={{
              ...ListStyles.rowTable,
              borderWidth: lineIndexItem === key ? 1 : 0,
              borderColor: CustomColor.colorList.red,
            }}
            onPress={() => {}}
            disabled={completeDisable}>
            <View style={{...ListStyles.headerCell, width: columnWidths.stt}}>
              <Text>{key + 1}</Text>
            </View>
            {selectedColumns.includes('Vị trí') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.viTri}}>
                <Text>{value.vitri}</Text>
              </View>
            )}
            {selectedColumns.includes('Mã VT') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.maVT}}>
                <Text>{value.maVatTu}</Text>
              </View>
            )}
            {selectedColumns.includes('Tên VT') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.tenVT}}>
                <Text>{value.tenVatTu}</Text>
              </View>
            )}
            {selectedColumns.includes('Số Lô') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.soLo}}>
                <Text>{value.soLo}</Text>
              </View>
            )}
            {selectedColumns.includes('SLMD') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.slMD}}>
                <Text>{value.slmd}</Text>
              </View>
            )}
            {selectedColumns.includes('SLKG') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.slKG}}>
                <Text>{value.slkg}</Text>
              </View>
            )}
            {selectedColumns.includes('Ngày SX') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.ngaySX}}>
                <Text>{formatDate(new Date(value.ngaySX))} </Text>
              </View>
            )}
            {selectedColumns.includes('Máy SX') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.maySX}}>
                <Text>{value.maySanXuat}</Text>
              </View>
            )}
            {selectedColumns.includes('Ca SX') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.caSX}}>
                <Text>{value.caSX}</Text>
              </View>
            )}
            {selectedColumns.includes('LSX') && (
              <View style={{...ListStyles.headerCell, width: columnWidths.lsx}}>
                <Text>{value.lsx}</Text>
              </View>
            )}
            {selectedColumns.includes('Tên NCC/KH') && (
              <View
                style={{...ListStyles.headerCell, width: columnWidths.ncC_KH}}>
                <Text>{value.ncC_KH}</Text>
              </View>
            )}
          </TouchableOpacity>,
        );
      });
    }
    return (
      <View style={ListStyles.viewTable}>
        <ScrollView horizontal={true} style={{width: device.width * 0.99}}>
          <View style={ListStyles.table}>
            <View style={ListStyles.headerTable}>
              <View style={{...ListStyles.headerCell, width: columnWidths.stt}}>
                <Text>STT</Text>
              </View>
              {selectedColumns.includes('Vị trí') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.viTri}}>
                  <Text>Vị Trí</Text>
                </View>
              )}
              {selectedColumns.includes('Mã VT') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.maVT}}>
                  <Text>Mã VT</Text>
                </View>
              )}
              {selectedColumns.includes('Tên VT') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.tenVT}}>
                  <Text>Tên VT</Text>
                </View>
              )}
              {selectedColumns.includes('Số Lô') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.soLo}}>
                  <Text>Số Lô</Text>
                </View>
              )}
              {selectedColumns.includes('SLMD') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.slMD}}>
                  <Text>SLMD</Text>
                </View>
              )}
              {selectedColumns.includes('SLKG') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.slKG}}>
                  <Text>SL KG</Text>
                </View>
              )}
              {selectedColumns.includes('Ngày SX') && (
                <View
                  style={{
                    ...ListStyles.headerCell,
                    width: columnWidths.ngaySX,
                  }}>
                  <Text>Ngày SX</Text>
                </View>
              )}
              {selectedColumns.includes('Máy SX') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.maySX}}>
                  <Text>Máy SX</Text>
                </View>
              )}
              {selectedColumns.includes('Ca SX') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.caSX}}>
                  <Text>Ca SX</Text>
                </View>
              )}
              {selectedColumns.includes('LSX') && (
                <View
                  style={{...ListStyles.headerCell, width: columnWidths.lsx}}>
                  <Text>LSX</Text>
                </View>
              )}
              {selectedColumns.includes('Tên NCC/KH') && (
                <View
                  style={{
                    ...ListStyles.headerCell,
                    width: columnWidths.ncC_KH,
                  }}>
                  <Text>Tên KH</Text>
                </View>
              )}
            </View>
            <ScrollView
              style={{padding: 1, height: '90%', width: '100%'}}
              horizontal={true}>
              <ScrollView style={{height: listInventory.length * 70}}>
                {rows}
              </ScrollView>
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
      <View style={ListStyles.listView}>
        <HeaderComponent
          backButton={true}
          handleBack={handleBack}
          iconRight={<></>}
          title="Tồn kho"
          // handleRightIconButton={handleRightIconButton}
        />
        {/* {generalTable(inventoryAtom?.Objects)} */}
        <View
          style={{
            ...ListStyles.headerRef,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}>
          <View style={ListStyles.qrContainer}>
            <Text
              style={{...ListStyles.headerText, fontWeight: 'bold', width: 80}}>
              Vị trí:{' '}
            </Text>
            <View style={ListStyles.textInputWithButton}>
              <TextInput
                onChangeText={text => handelInputChange('maLocator', text)}
                value={formSearch.maLocator}
                onFocus={() => handelFocusInput('maQrCuon')}
                // style={{ ...warehouseDetailStyle.warehousePressible, borderColor: CustomColor.colorList.grey, width: 260 }}
                placeholder="Vui lòng scan QR vị trí"
              />
              <View style={{flexDirection: 'row'}}>
                {settings.useCameraScan && (
                  <Pressable
                    onPress={() => {
                      setCameraField('maLocator');
                      setShowCameraModal(true);
                    }}
                    style={ListStyles.iconPressable}>
                    <FontAwesomeIcon
                      icon={faCamera}
                      size={18}
                      color={AppColors.primary}
                    />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => handelFocusInput('maLocator')}
                  style={ListStyles.iconPressable}>
                  <FontAwesomeIcon
                    icon={faXmark}
                    size={18}
                    color={CustomColor.colorList.grey}
                  />
                </Pressable>
              </View>
            </View>
          </View>
          <View style={{...ListStyles.qrContainer, marginTop: 10}}>
            <Text
              style={{...ListStyles.headerText, fontWeight: 'bold', width: 80}}>
              Qr Cuộn:{' '}
            </Text>
            <View style={ListStyles.textInputWithButton}>
              <TextInput
                onChangeText={text => handelInputChange('maQrCuon', text)}
                value={formSearch.maQrCuon}
                onFocus={() => handelFocusInput('maLocator')}
                // style={{ ...warehouseDetailStyle.warehousePressible, borderColor: CustomColor.colorList.grey, width: 260 }}
                placeholder="Vui lòng scan QR cuộn"
              />
              <View style={{flexDirection: 'row'}}>
                {settings.useCameraScan && (
                  <Pressable
                    onPress={() => {
                      setCameraField('maQrCuon');
                      setShowCameraModal(true);
                    }}
                    style={ListStyles.iconPressable}>
                    <FontAwesomeIcon
                      icon={faCamera}
                      size={18}
                      color={AppColors.primary}
                    />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => handelFocusInput('maQrCuon')}
                  style={ListStyles.iconPressable}>
                  <FontAwesomeIcon
                    icon={faXmark}
                    size={18}
                    color={CustomColor.colorList.grey}
                  />
                </Pressable>
              </View>
            </View>
          </View>
          <View style={{...ListStyles.header, padding: 10}}>
            <View
              style={{
                ...ListStyles.oneLine,
                height: 40,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
              {/* <Text style={{ ...ListStyles.headerText, fontWeight: 'bold' }}>Lines</Text> */}
              <View style={{...ListStyles.oneLine, gap: 10}}>
                <Pressable
                  onPress={handleOpenSettingModal}
                  style={{
                    backgroundColor: AppColors.primary,
                    padding: 10,
                    borderRadius: 10,
                  }}>
                  <FontAwesomeIcon
                    icon={faGear}
                    size={15}
                    color={CustomColor.colorList.shadowWhite}
                  />
                </Pressable>
                {/* <Pressable
                                    onPress={handleOpenLineModal}
                                    style={{ backgroundColor: AppColors.primary, padding: 10, borderRadius: 10 }}
                                >
                                    <FontAwesomeIcon icon={faAdd} size={15} color={CustomColor.colorList.shadowWhite} />
                                </Pressable> */}
              </View>
            </View>
            <View>{generalTable(listInventory)}</View>
          </View>
        </View>
        {settingModal && (
          <SettingWarehouseDetail
            handleOpenSettingWarehouseDetail={handleOpenSettingModal}
            // onSubmit={() => { }}
            open={settingModal}
            title="Cài đặt hiển thị"
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
            columns={columns}
          />
        )}
      </View>
    </CameraScannerWrapper>
  );
};

export default ListInventory;
