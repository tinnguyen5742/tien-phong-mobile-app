import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import {ListNhapCuonStyles} from './ListNhapCuonStyle';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faGear,
  faLeftLong,
  faPlus,
  faRightLong,
} from '@fortawesome/free-solid-svg-icons';
import {CustomColor, formatDate} from '../../../ults';
import {useSetRecoilState} from 'recoil';
import {loadingStore} from '../../../Store/loadingStore';
import {TypeFormNhapCuon} from '../Type/NhapCuonType';
import Toast from 'react-native-toast-message';
import {get_cus} from '../../../Base/api/api_service';
import SettingModal from '../../Produce/Modal/SettingModal';
import {NhapCuonLineAtom, NhapCuonStatusTypeAtom} from '../store/NhapCuonStore';
import {AppColors} from '../../../../colors';
const ListNhapCuon = () => {
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setTypeNhapCuonStatusTypeAtom = useSetRecoilState(
    NhapCuonStatusTypeAtom,
  );
  const setLineNhapCuonAtom = useSetRecoilState(NhapCuonLineAtom);
  const navigate = useNavigation();

  //!useState
  const [list, setList] = useState([] as TypeFormNhapCuon[]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(10);
  const [settingModal, setSettingModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'maKho',
    'maCuonNhap',
    'maViTriNhap',
    'ngayTao',
    'soCT',
  ]); // Default selected columns
  const handleBack = () => {
    navigate.goBack();
  };
  const columns = [
    {name: 'maKho', label: 'Mã kho'},
    {name: 'soCT', label: 'Số CT'},
    {name: 'maCuonNhap', label: 'Mã cuộn nhập'},
    {name: 'maViTriNhap', label: 'Mã vị trí nhập'},
    {name: 'ngayTao', label: 'Ngày tạo'},
  ];
  const WidthCellTable = {
    stt: 50,
    SoCT: 170,
    maKho: 80,
    maCuonNhap: 150,
    maViTriNhap: 150,
    ngayTao: 100,
  };
  const getList = async () => {
    setLoadingAtom(true);
    try {
      // console.log("param: ", `/produce/list?pageNumber=${page}&pageSize=10&maBoPhan=${boPhanValue?.maBoPhan}&month=${(boPhanValue.month.getMonth() + 1)}&year=${boPhanValue.month.getFullYear()}`);
      const item = await get_cus(
        `/NhapCuon/get_list_nhapcuon?pageNumber=${page}&pageSize=10`,
        {},
      );
      if (item.status) {
        console.log('item: ', item.data);
        setList(item.data);
        setTotalPage(item.totalCount);
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
          text2: 'Danh sách trống',
        });
      }
    } finally {
      setLoadingAtom(false);
    }
  };
  useEffect(() => {
    getList();
  }, [page]);
  useFocusEffect(
    useCallback(() => {
      getList(); // Fetch list whenever the screen is focused

      return () => {
        // Clean up if needed when screen goes out of focus
      };
    }, [page]), // Dependency array includes page to ensure list is updated if page changes while focused
  );
  const handleEdit = (item: TypeFormNhapCuon) => {
    setLineNhapCuonAtom(item);
    setTypeNhapCuonStatusTypeAtom('EDIT');
    navigate.navigate('NhapCuon' as never);
  };
  const handleOpenSettingModal = () => {
    setSettingModal(!settingModal);
  };
  const handlePreviousPage = () => {
    if (page > 1) {
      let pagePrevious = page - 1;
      setPage(pagePrevious);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Trang tối đa',
      });
    }
  };
  const handleNextPage = () => {
    const limit = 10;
    const maxPage = Math.ceil(totalPage / limit);
    console.log('maxPage: ', maxPage);
    if (page >= maxPage) {
      // let nextPage = page - 1;
      // setPage();
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Trang tối đa',
      });
    } else {
      setPage(page + 1);
    }
  };
  const handleRightIconButton = () => {
    // setDetailInventoryAtom([]);
    setTypeNhapCuonStatusTypeAtom('NEW');
    navigate.navigate('NhapCuon' as never);
  };
  const generalTable = (data: TypeFormNhapCuon[]) => {
    let rows: JSX.Element[] = [];

    if (data) {
      data.map((value: TypeFormNhapCuon, key: number) => {
        // console.log('value: ', value);
        rows.push(
          <TouchableOpacity
            key={key}
            style={{
              ...ListNhapCuonStyles.rowTable,
              borderWidth: 1,
              borderColor: AppColors.primary,
            }}
            onPress={() => handleEdit(value)} // Pass line data and index to handleEdit
          >
            <View
              style={{
                ...ListNhapCuonStyles.headerCell,
                minWidth: WidthCellTable.stt,
              }}>
              <Text>{key + 1}</Text>
            </View>
            {selectedColumns.includes('soCT') && (
              <View
                style={{
                  ...ListNhapCuonStyles.headerCell,
                  minWidth: WidthCellTable.SoCT,
                }}>
                <Text>{value.soCT}</Text>
              </View>
            )}
            {selectedColumns.includes('maKho') && (
              <View
                style={{
                  ...ListNhapCuonStyles.headerCell,
                  minWidth: WidthCellTable.maKho,
                }}>
                <Text>{value.maKho}</Text>
              </View>
            )}
            {selectedColumns.includes('maCuonNhap') && (
              <View
                style={{
                  ...ListNhapCuonStyles.headerCell,
                  minWidth: WidthCellTable.maCuonNhap,
                }}>
                <Text>{value.maCuonNhap}</Text>
              </View>
            )}
            {selectedColumns.includes('maViTriNhap') && (
              <View
                style={{
                  ...ListNhapCuonStyles.headerCell,
                  minWidth: WidthCellTable.maViTriNhap,
                }}>
                <Text>{value.maViTriNhap}</Text>
              </View>
            )}
            {selectedColumns.includes('ngayTao') && (
              <View
                style={{
                  ...ListNhapCuonStyles.headerCell,
                  minWidth: WidthCellTable.ngayTao,
                }}>
                <Text>{formatDate(new Date(value.ngayTao))}</Text>
              </View>
            )}
            {/* {selectedColumns.includes("GhiChu") && (
                            <View style={{ ...ListNhapCuonStyles.headerCell, minWidth: 100 }}>
                                <Text>{value.ghiChu}</Text>
                            </View>
                        )} */}
          </TouchableOpacity>,
        );
      });
    }

    return (
      <View style={ListNhapCuonStyles.table}>
        <ScrollView style={{height: '100%'}} horizontal>
          <View style={{flexDirection: 'column'}}>
            {/* Header table */}
            <View style={ListNhapCuonStyles.headerTable}>
              <View
                style={{
                  ...ListNhapCuonStyles.headerCell,
                  minWidth: WidthCellTable.stt,
                }}>
                <Text>STT</Text>
              </View>
              {selectedColumns.includes('soCT') && (
                <View
                  style={{
                    ...ListNhapCuonStyles.headerCell,
                    minWidth: WidthCellTable.SoCT,
                  }}>
                  <Text>Số CT</Text>
                </View>
              )}
              {selectedColumns.includes('maKho') && (
                <View
                  style={{
                    ...ListNhapCuonStyles.headerCell,
                    minWidth: WidthCellTable.maKho,
                  }}>
                  <Text>Mã Kho</Text>
                </View>
              )}
              {selectedColumns.includes('maCuonNhap') && (
                <View
                  style={{
                    ...ListNhapCuonStyles.headerCell,
                    minWidth: WidthCellTable.maCuonNhap,
                  }}>
                  <Text>Mã Cuộn Nhập</Text>
                </View>
              )}
              {selectedColumns.includes('maViTriNhap') && (
                <View
                  style={{
                    ...ListNhapCuonStyles.headerCell,
                    minWidth: WidthCellTable.maViTriNhap,
                  }}>
                  <Text>Mã Vị Trí Nhập</Text>
                </View>
              )}
              {selectedColumns.includes('ngayTao') && (
                <View
                  style={{
                    ...ListNhapCuonStyles.headerCell,
                    minWidth: WidthCellTable.ngayTao,
                  }}>
                  <Text>Ngày Tạo</Text>
                </View>
              )}
            </View>
            <ScrollView style={{flexDirection: 'column'}}>{rows}</ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };
  return (
    <View style={ListNhapCuonStyles.listView}>
      <HeaderComponent
        backButton={true}
        handleBack={handleBack}
        iconRight={
          <TouchableOpacity onPress={handleRightIconButton}>
            <FontAwesomeIcon
              icon={faPlus}
              size={25}
              color={AppColors.primary}
            />
          </TouchableOpacity>
        }
        title="Danh sách Nhập cuộn"
      />
      <View
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
        <Pressable
          onPress={handleOpenSettingModal}
          style={ListNhapCuonStyles.settingBtn}>
          <Text style={{color: 'white'}}>Tùy chỉnh</Text>
          <FontAwesomeIcon icon={faGear} size={20} color="white" />
        </Pressable>
      </View>
      {generalTable(list)}
      <View style={ListNhapCuonStyles.navigateView}>
        <Pressable
          onPress={handlePreviousPage}
          style={ListNhapCuonStyles.buttonNavigate}>
          <FontAwesomeIcon icon={faLeftLong} size={20} color="white" />
        </Pressable>
        <View style={ListNhapCuonStyles.textViewNavigate}>
          <Text style={ListNhapCuonStyles.textNavigate}>{page}</Text>
        </View>
        <Pressable
          onPress={handleNextPage}
          style={ListNhapCuonStyles.buttonNavigate}>
          <FontAwesomeIcon icon={faRightLong} size={20} color="white" />
        </Pressable>
      </View>
      {settingModal && (
        <SettingModal
          handleOpenSettingModal={handleOpenSettingModal}
          onSubmit={() => {}}
          open={settingModal}
          title="Cài đặt hiển thị"
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          columns={columns}
        />
      )}
    </View>
  );
};
export default ListNhapCuon;
