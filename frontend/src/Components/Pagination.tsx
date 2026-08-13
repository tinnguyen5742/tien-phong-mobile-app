import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faLeftLong, faRightLong} from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  page: number;
  totalPage: number;
  onPageChange: (newPage: number) => void;
}

const Pagination = ({page, totalPage, onPageChange}: PaginationProps) => {
  // 1. Kiểm tra nếu totalPage không phải là số hoặc <= 1 thì ẩn luôn
  if (isNaN(totalPage) || totalPage <= 1) return null;

  // 2. Chống lỗi page bị NaN hoặc nằm ngoài phạm vi
  const safePage = isNaN(page) ? 1 : Math.max(1, Math.min(page, totalPage));

  return (
    <View className="flex-row justify-between items-center p-4 bg-white border-t border-gray-200">
      <Pressable
        onPress={() => safePage > 1 && onPageChange(safePage - 1)}
        disabled={safePage <= 1}
        className={`p-3 rounded-md w-12 items-center ${
          safePage > 1 ? 'bg-primary' : 'bg-gray-300'
        }`}>
        <FontAwesomeIcon icon={faLeftLong} size={18} color="white" />
      </Pressable>

      <View className="bg-gray-100 px-6 py-2 rounded-md border border-gray-300">
        <Text className="text-lg font-bold text-primary">
          {safePage}{' '}
          <Text className="text-gray-400 font-normal">/ {totalPage}</Text>
        </Text>
      </View>

      <Pressable
        onPress={() => safePage < totalPage && onPageChange(safePage + 1)}
        disabled={safePage >= totalPage}
        className={`p-3 rounded-md w-12 items-center ${
          safePage < totalPage ? 'bg-primary' : 'bg-gray-300'
        }`}>
        <FontAwesomeIcon icon={faRightLong} size={18} color="white" />
      </Pressable>
    </View>
  );
};

export default Pagination;
