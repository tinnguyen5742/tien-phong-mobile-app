import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {getApi, postApi} from '../../../Base/api/api_service';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {StaffType} from '../type';
import Toast from 'react-native-toast-message';
import Pagination from '../../../Components/Pagination';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {loadingStore} from '../../../Store/loadingStore';
import CollapsibleAccordionsComponent from '../../../Base/CollapsibleAccordions/CollapsibleAccordionsComponent';
// import CollapsibleAccordionsComponent from "../../../Base/CollapsibleAccordions/CollapsibleAccordionsComponent";

type StaffTypeProps = {
  handleStaffModal: () => void; // Giữ nguyên tên gốc của bạn
  open: boolean;
  handleGetValue: (value: StaffType) => void;
};

type paramSearch = {
  LaPhanXuong?: string;
  TenNV?: string;
  TenBoPhan?: string;
  MaNV?: string;
  PageNumber: number;
  PageSize: number;
};

const StaffModal = (props: StaffTypeProps) => {
  const {handleStaffModal, open, handleGetValue} = props;

  const [loading, setLoading] = useState(false);
  const [listUser, setListUser] = useState<StaffType[]>([]);
  const [totalPage, setTotalPage] = useState(0); // Thêm để quản lý phân trang
  const [search, setSearch] = useState<paramSearch>({
    PageNumber: 1,
    PageSize: 10,
    LaPhanXuong: 'Y',
    MaNV: '',
    TenBoPhan: '',
    TenNV: '',
  });

  useEffect(() => {
    if (open) {
      handleGetNVSX();
    }
  }, [open]);

  const handleInputChange = (text: string, field: string) => {
    setSearch({...search, [field]: text});
  };

  const handleSearch = () => {
    handleGetNVSX(search);
  };

  const setLoadingAtom = useSetRecoilState(loadingStore);
  const handleGetNVSX = async (searchParams?: paramSearch) => {
    setLoadingAtom(true);
    try {
      const url = `/employees/list?MaNV=&LaPhanXuong=&TenNV=&TenBoPhan=&pageNumber=1&pageSize=10`;
      const item = await getApi(url, {});
      // console.log("handleGetStaff url: ", url);
      console.log('handleGetStaff: ', item);

      if (item?.status && item?.data.length > 0) {
        setListUser(item.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy danh sách nhân viên',
        });
      }
    } catch (error: any) {
      // console.error('Error fetching data state:', error);
      if (error.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: error.message
            ? error.message
            : 'Lỗi không tìm thấy danh sách nhân viên',
        });
      }
    } finally {
      setLoadingAtom(false);
    }
  };

  const handleCancelSearch = () => {
    const resetSearch = {
      ...search,
      TenNV: '',
      MaNV: '',
      TenBoPhan: '',
      PageNumber: 1,
    };
    setSearch(resetSearch);
    handleGetNVSX(resetSearch);
  };

  const handleCancel = () => {
    handleStaffModal();
  };

  const TextLinePressable = (label: string, value: string) => (
    <View className="flex-row justify-between items-start mb-1">
      <Text className="w-1/4 text-slate-400 text-xs font-semibold uppercase">
        {label}
      </Text>
      <Text className="flex-1 text-slate-700 font-bold" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  const TextInputCus = (label: string, value: string, field: string) => (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-slate-600 font-medium">{label}</Text>
      <TextInput
        className="w-1/2 border border-slate-200 rounded-lg p-2 bg-slate-50 text-right text-slate-800"
        value={value}
        onChangeText={text => handleInputChange(text, field)}
      />
    </View>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-[30px] w-full max-w-sm shadow-xl overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-800">
              Chọn nhân viên
            </Text>
            <Pressable
              onPress={handleCancel}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-100">
              <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Body */}
          <View className="p-3 h-[450px]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* <View className="mb-2">
                            <CollapsibleAccordionsComponent title="Tìm kiếm" heighContent={220}>
                                <View className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    {TextInputCus('Mã NV', search.MaNV || '', 'MaNV')}
                                    {TextInputCus('Tên NV', search.TenNV || '', 'TenNV')}
                                    {TextInputCus('Bộ phận', search.TenBoPhan || '', 'TenBoPhan')}

                                    <View className="flex-row justify-between mt-2 space-x-3">
                                        <Pressable
                                            className="flex-1 bg-red-500 py-3 rounded-xl active:opacity-70"
                                            onPress={handleCancelSearch}
                                        >
                                            <Text className="text-white text-center font-bold">Hủy</Text>
                                        </Pressable>
                                        <Pressable
                                            className="flex-1 bg-primary py-3 rounded-xl active:opacity-70"
                                            onPress={handleSearch}
                                        >
                                            <Text className="text-white text-center font-bold">Tìm</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </CollapsibleAccordionsComponent>
                        </View> */}
              {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                            {JSON.stringify(listUser, null, 2)}
                        </Text> */}
              {loading ? (
                <View className="py-10 justify-center items-center">
                  <ActivityIndicator size="large" color="#0891b2" />
                </View>
              ) : listUser && listUser.length > 0 ? (
                listUser.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleGetValue(item)}
                    className="border border-slate-100 bg-white p-4 rounded-2xl mb-3 shadow-sm active:bg-cyan-50">
                    {TextLinePressable('Mã NV', item.maNV)}
                    {TextLinePressable('Tên NV', item.tenNV)}
                    {TextLinePressable('Bộ phận', item.tenBoPhan)}
                  </Pressable>
                ))
              ) : (
                <View className="py-10 items-center">
                  <Text className="text-slate-400 italic">
                    Không có dữ liệu
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Pagination - Dùng component chung */}
          <View className="border-t border-slate-50">
            <Pagination
              page={search.PageNumber}
              totalPage={totalPage}
              onPageChange={newPage => {
                const nextSearch = {...search, PageNumber: newPage};
                setSearch(nextSearch);
                handleGetNVSX(nextSearch);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StaffModal;
