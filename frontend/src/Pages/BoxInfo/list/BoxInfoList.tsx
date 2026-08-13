import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HeaderComponent from '../../../Base/HeaderComponent/headerComponent';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {
  faGear,
  faLeftLong,
  faPlus,
  faRightLong,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import {CustomColor, formatDate} from '../../../ults';
import {useSetRecoilState} from 'recoil';
import {useCallback, useEffect, useState} from 'react';
import {loadingStore} from '../../../Store/loadingStore';
import {get_cus} from '../../../Base/api/api_service';
import Toast from 'react-native-toast-message';
import {ListBoxInfoStyles} from './BoxListStyle';
import {BoxDetailAtom, BoxInfoAtomStatus} from '../Atom/BoxInfoAtom';
import {BoxInfoTypeFromResponse} from '../Types/BoxInfoType';
import SettingModal from '../../Produce/Modal/SettingModal';
import {AppColors} from '../../../../colors';
const ListBoxInfo = () => {
  //atom
  const setBoxInfoType = useSetRecoilState(BoxInfoAtomStatus);
  const setLoadingAtom = useSetRecoilState(loadingStore);
  const setProduceDetailAtom = useSetRecoilState(BoxDetailAtom);
  //state
  const [list, setList] = useState([] as BoxInfoTypeFromResponse[]);
  const [boPhanModal, setBoPhanModal] = useState(true);
  // const [boPhanValue, setBoPhanValue] = useState<BoPhanModalValue>();
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(10);
  const [settingModal, setSettingModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'Ngay',
    'SoCT',
  ]); // Default selected columns
  const navigate = useNavigation();
  const columns = [
    {name: 'Ngay', label: 'Ngày'},
    {name: 'SoCT', label: 'Số CT'},
  ];

  const handleBack = () => {
    navigate.goBack();
  };
  const handleRightIconButton = () => {
    // setDetailInventoryAtom([]);
    setBoxInfoType('NEW');
    navigate.navigate('BoxInfoDetail' as never);
  };
  const getList = async () => {
    setLoadingAtom(true);
    try {
      // console.log("param: ", `/produce/list?pageNumber=${page}&pageSize=10&maBoPhan=${boPhanValue?.maBoPhan}&month=${(boPhanValue.month.getMonth() + 1)}&year=${boPhanValue.month.getFullYear()}`);
      const item = await get_cus(
        `/boxinfo/get_list_box_info?pageNumber=${page}&pageSize=10`,
        {},
      );
      if (item.status) {
        console.log('item: ', item);
        setList(item.data);
        setTotalPage(item.totalItems);
        // setForm((prevValues: any) => ({
        //     ...prevValues,
        //     KhoTKCat: item.khoTK
        // }));
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
  const handleEdit = (item: BoxInfoTypeFromResponse) => {
    console.log('item: ', item);
    setProduceDetailAtom(item);
    setBoxInfoType('EDIT');
    navigate.navigate('BoxInfoDetail' as never);
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
  const handelOpenBoPhanModal = () => {
    setBoPhanModal(!boPhanModal);
  };

  const handleRefresh = () => {
    getList();
  };
  const generalTable = (data: BoxInfoTypeFromResponse[]) => {
    let rows: JSX.Element[] = [];

    if (data) {
      data.map((value: BoxInfoTypeFromResponse, key: number) => {
        // console.log('value: ', value);
        rows.push(
          <TouchableOpacity
            key={key}
            style={{
              ...ListBoxInfoStyles.rowTable,
              borderWidth: 1,
              borderColor: AppColors.primary,
            }}
            onPress={() => handleEdit(value)} // Pass line data and index to handleEdit
          >
            <View style={{...ListBoxInfoStyles.headerCell, minWidth: 60}}>
              <Text>{key + 1}</Text>
            </View>
            {selectedColumns.includes('Ngay') && (
              <View style={{...ListBoxInfoStyles.headerCell, minWidth: 120}}>
                <Text>{formatDate(new Date(value.ngayTao))}</Text>
              </View>
            )}
            {selectedColumns.includes('SoCT') && (
              <View style={{...ListBoxInfoStyles.headerCell, minWidth: 200}}>
                <Text>{value.soCT}</Text>
              </View>
            )}
          </TouchableOpacity>,
        );
      });
    }

    return (
      <View style={ListBoxInfoStyles.table}>
        <ScrollView style={{height: '100%'}} horizontal>
          <View style={{flexDirection: 'column'}}>
            {/* Header table */}
            <View style={ListBoxInfoStyles.headerTable}>
              <View style={{...ListBoxInfoStyles.headerCell, minWidth: 60}}>
                <Text>STT</Text>
              </View>
              {selectedColumns.includes('Ngay') && (
                <View style={{...ListBoxInfoStyles.headerCell, minWidth: 120}}>
                  <Text>Ngày</Text>
                </View>
              )}
              {selectedColumns.includes('SoCT') && (
                <View style={{...ListBoxInfoStyles.headerCell, minWidth: 200}}>
                  <Text>Số CT</Text>
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
    <View style={ListBoxInfoStyles.listView}>
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
        title="Danh sách thùng"
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
          style={ListBoxInfoStyles.settingBtn}>
          <Text style={{color: 'white'}}>Tùy chỉnh</Text>
          <FontAwesomeIcon icon={faGear} size={20} color="white" />
        </Pressable>
        {/* <Pressable onPress={() => setBoPhanModal(true)} style={ListBoxInfoStyles.settingBtn}>
                    <Text style={{ color: 'white' }}>Chọn bộ phận</Text>
                </Pressable> */}
        <Pressable onPress={handleRefresh} style={ListBoxInfoStyles.settingBtn}>
          <FontAwesomeIcon icon={faRotateRight} size={20} color="white" />
        </Pressable>
      </View>
      {generalTable(list)}
      <View style={ListBoxInfoStyles.navigateView}>
        <Pressable
          onPress={handlePreviousPage}
          style={ListBoxInfoStyles.buttonNavigate}>
          <FontAwesomeIcon icon={faLeftLong} size={20} color="white" />
        </Pressable>
        <View style={ListBoxInfoStyles.textViewNavigate}>
          <Text style={ListBoxInfoStyles.textNavigate}>{page}</Text>
        </View>
        <Pressable
          onPress={handleNextPage}
          style={ListBoxInfoStyles.buttonNavigate}>
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
export default ListBoxInfo;
