import React from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
const {width: screenWidth} = Dimensions.get('window');
// Định nghĩa kiểu dữ liệu cho Column
export interface TableColumn {
  name: string;
  label: string;
  width?: number; // Cho phép tùy chỉnh độ rộng từng cột
}

interface GeneralTableProps {
  data: any[];
  columns: TableColumn[];
  selectedColumns: string[];
  onRowPress?: (item: any, index: number) => void;
  renderCell?: (
    columnName: string,
    item: any,
    index: number,
  ) => React.ReactNode; // Để xử lý format đặc biệt như ngày tháng
}

const GeneralTable = ({
  data,
  columns,
  selectedColumns,
  onRowPress,
  renderCell,
}: GeneralTableProps) => {
  // Lọc ra các cột được chọn để hiển thị
  const visibleColumns = columns.filter(col =>
    selectedColumns.includes(col.name),
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View className="flex-col">
          {/* Header table */}
          <View className="flex-row bg-primary py-3 border-b border-gray-200">
            {visibleColumns.map((col, index) => (
              <View
                key={col.name}
                className={`items-center justify-center ${
                  index < visibleColumns.length - 1
                    ? 'border-r border-white/20'
                    : ''
                }`}
                // Kiểm tra nếu là cột STT thì cho độ rộng cố định nhỏ hơn
                style={{width: col.name === 'STT' ? 60 : col.width || 100}}>
                <Text className="text-white font-bold">{col.label}</Text>
              </View>
            ))}
          </View>

          {/* Body table */}
          <ScrollView className="flex-col">
            {data?.length > 0 ? (
              data.map((value: any, key: number) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => onRowPress && onRowPress(value, key)}
                  className={`flex-row items-center border-b border-gray-200 py-3 ${
                    key % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}>
                  {visibleColumns.map(col => {
                    // Xử lý riêng cho cột STT
                    if (col.name === 'STT') {
                      return (
                        <View
                          key="STT"
                          className="items-center justify-center border-r border-gray-200"
                          style={{width: 60}}>
                          <Text className="text-gray-700">{key + 1}</Text>
                        </View>
                      );
                    }

                    // Lấy nội dung tùy chỉnh từ props renderCell truyền vào
                    const customContent = renderCell
                      ? renderCell(col.name, value, key)
                      : null;

                    return (
                      <View
                        key={col.name}
                        style={{width: col.width || 100}}
                        className="items-center justify-center border-r border-gray-200">
                        {/* Kiểm tra: Nếu customContent có giá trị (không null/undefined) thì ưu tiên hiển thị */}
                        {customContent !== null &&
                        customContent !== undefined ? (
                          customContent
                        ) : (
                          // Ngược lại mới hiển thị text mặc định từ data
                          <Text className="text-gray-700 text-center">
                            {value[col.name] !== undefined
                              ? String(value[col.name])
                              : ''}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={{width: screenWidth}} // Ép độ rộng bằng màn hình
                className="p-10 items-center justify-center">
                <Text className="text-gray-400">Không có dữ liệu</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default GeneralTable;
