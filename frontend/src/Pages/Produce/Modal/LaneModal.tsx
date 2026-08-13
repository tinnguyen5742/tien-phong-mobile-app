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
import {postApi} from '../../../Base/api/api_service';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {LaneType} from '../type';
import Toast from 'react-native-toast-message';
import CollapsibleAccordionsComponent from '../../../Base/CollapsibleAccordions/CollapsibleAccordionsComponent';
import Pagination from '../../../Components/Pagination';

type LaneTypeProps = {
  handleLaneModal: () => void;
  open: boolean;
  handleGetValue: (value: LaneType) => void;
};

type paramSearch = {
  MaLook?: string;
  TenLook?: string;
  MaDoiTuong?: string;
  TenDoiTuong?: string;
  PageNumber: number;
  PageSize: number;
};

const LaneModal = (props: LaneTypeProps) => {
  const {handleLaneModal, open, handleGetValue} = props;

  const [search, setSearch] = useState<paramSearch>({
    MaLook: '',
    TenLook: '',
    MaDoiTuong: '',
    TenDoiTuong: '',
    PageNumber: 1,
    PageSize: 10,
  });
  const [listLane, setListLane] = useState<LaneType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(0); // Thêm state quản lý tổng trang

  useEffect(() => {
    if (open) handleGetLane(search);
  }, [open]);

  const handleInputChange = (text: string, field: string) => {
    setSearch(prev => ({...prev, [field]: text}));
  };

  const handleGetLane = async (searchInput: paramSearch) => {
    setLoading(true);
    // postApi(`/produce/getLookup`, searchInput, (err: any, resp: any) => {
    //     setLoading(false);
    //     if (!err) {
    //         setListLane(resp);
    //         // Giả định API trả về totalPage, nếu không bạn hãy chỉnh logic tính toán tại đây
    //         setTotalPage(10);
    //     } else {
    //         Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tìm thấy dữ liệu' });
    //     }
    // });
  };

  const handleSearch = () => handleGetLane(search);

  const handleCancelSearch = () => {
    const resetSearch = {
      ...search,
      MaLook: '',
      MaDoiTuong: '',
      TenDoiTuong: '',
      TenLook: '',
      PageNumber: 1,
    };
    setSearch(resetSearch);
    handleGetLane(resetSearch);
  };

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

  const TextLinePressable = (label: string, value: string) => (
    <View className="flex-row justify-between items-start mb-1">
      <Text className="w-1/3 text-slate-400 text-xs font-semibold uppercase">
        {label}
      </Text>
      <Text className="flex-1 text-slate-700 font-bold" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <Modal animationType="fade" transparent={true} visible={open}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-[30px] w-full max-w-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
            <Text className="text-xl font-bold text-slate-800">Chọn Lane</Text>
            <Pressable
              onPress={handleLaneModal}
              className="p-2 active:bg-slate-100 rounded-full">
              <FontAwesomeIcon icon={faXmark} size={20} color="#64748b" />
            </Pressable>
          </View>

          <View className="p-3 h-[500px]">
            {/* Search Accordion */}
            <CollapsibleAccordionsComponent title="Tìm kiếm" heighContent={280}>
              <View className="p-4 bg-slate-100/50 rounded-2xl mb-2">
                {TextInputCus('Mã Look', search.MaLook || '', 'MaLook')}
                {TextInputCus('Tên', search.TenLook || '', 'TenLook')}
                {TextInputCus(
                  'Mã đối tượng',
                  search.MaDoiTuong || '',
                  'MaDoiTuong',
                )}
                {TextInputCus(
                  'Tên đối tượng',
                  search.TenDoiTuong || '',
                  'TenDoiTuong',
                )}

                <View className="flex-row space-x-3 mt-2">
                  <Pressable
                    className="flex-1 bg-red-500 py-3 rounded-xl active:opacity-70"
                    onPress={handleCancelSearch}>
                    <Text className="text-white text-center font-bold">
                      Hủy
                    </Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 bg-primary py-3 rounded-xl active:opacity-70"
                    onPress={handleSearch}>
                    <Text className="text-white text-center font-bold">
                      Tìm
                    </Text>
                  </Pressable>
                </View>
              </View>
            </CollapsibleAccordionsComponent>

            {/* List Items */}
            <ScrollView
              className="flex-1 mt-2"
              showsVerticalScrollIndicator={false}>
              {loading ? (
                <View className="py-10">
                  <ActivityIndicator size="large" color="#0891b2" />
                </View>
              ) : listLane && listLane.length > 0 ? (
                listLane.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleGetValue(item)}
                    className="border border-slate-100 bg-white p-4 rounded-2xl mb-3 shadow-sm active:bg-cyan-50">
                    {TextLinePressable('Mã Look', item.maLook)}
                    {TextLinePressable('Tên Look', item.tenLook)}
                    {TextLinePressable('Tên đối tượng', item.tenDoiTuong)}
                    {TextLinePressable('Mã đối tượng', item.maDoiTuong)}
                  </Pressable>
                ))
              ) : (
                <View className="py-10 items-center">
                  <Text className="text-slate-400 italic">
                    Không có dữ liệu hiển thị
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Pagination */}
          <View className="border-t border-slate-50">
            <Pagination
              page={search.PageNumber}
              totalPage={totalPage}
              onPageChange={newPage => {
                const updatedSearch = {...search, PageNumber: newPage};
                setSearch(updatedSearch);
                handleGetLane(updatedSearch);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LaneModal;
