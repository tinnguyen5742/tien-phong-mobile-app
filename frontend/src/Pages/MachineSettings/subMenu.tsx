import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCogs,
  faPrint,
  faLayerGroup,
  faScissors,
  faSlidersH,
  faWind,
  faExchangeAlt,
  faCut,
  faBoxOpen,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {useRecoilState} from 'recoil';
import {userAtom} from '../Login/store/userAtom';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const SubMachineSettings = () => {
  const navigate = useNavigation();
  const handleBack = () => navigate.goBack();
  const [userStore, setUserStore] = useRecoilState(userAtom);

  // Danh sách menuItems mới theo yêu cầu của bạn
  const menuItems = [
    {
      id: 1,
      userRoles: ['TST'],
      title: 'Thông số thổi',
      icon: faWind,
      screen: 'BlowingSettingsList',
      color: '#3B82F6',
    },
    {
      id: 2,
      userRoles: ['TSI'],
      title: 'Thông số máy in',
      icon: faPrint,
      screen: 'PrintingSettingsList',
      color: '#EC4899',
    },
    {
      id: 3,
      userRoles: ['TSG'],
      title: 'Thông số máy ghép',
      icon: faLayerGroup,
      screen: 'LaminatingSettingsList',
      color: '#10B981',
    },
    {
      id: 6,
      userRoles: ['TSCH'],
      title: 'Thông số vận hành chia',
      icon: faExchangeAlt,
      screen: 'SlittingSettingsList',
      color: '#F59E0B',
    },
    {
      id: 4,
      userRoles: ['TSC'],
      title: 'Thông số máy cắt',
      icon: faCut,
      screen: 'CuttingSettingsList',
      color: '#EF4444',
    },
    {
      id: 5,
      userRoles: ['TSLT'],
      title: 'Thông số máy làm túi',
      icon: faBoxOpen,
      screen: 'BagMakingSettingsList',
      color: '#8B5CF6',
    },
    {
      id: 7,
      userRoles: ['KKK'],
      title: 'Thông số vận hành kiểm phẩm',
      icon: faEye,
      screen: 'InspectionSettingsList',
      color: '#6366F1',
    }, // Thêm icon faEye
  ];

  const handlePress = (item: any) => {
    navigate.navigate(item.screen as never);
  };

  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-gray-100" style={{paddingBottom: insets.bottom}}>
      <HeaderComponent
        backButton={true}
        handleBack={handleBack}
        iconRight={false}
        title="Ghi nhận thông số vận hành máy"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 16, paddingBottom: 40}}>
        {/* Layout Grid: Có thể đổi thành w-[47%] ở thẻ Pressable nếu muốn chia 2 cột */}
        <View className="flex-row flex-wrap justify-between">
          {menuItems
            .filter(item => {
              // Luôn hiển thị các menu không yêu cầu quyền (Cài đặt, Đăng xuất)
              if (item.userRoles.length === 0) return true;

              // 🌟 SỬA TẠI ĐÂY: Ép kiểu "as string[]" để TypeScript hiểu đây là mảng chuỗi
              const userRolesList = (userStore?.roles || []) as string[];

              if (userRolesList.length === 0) return false;

              // Bỏ gạch đỏ: Lúc này requiredRole (string) check trong mảng string[] hoàn toàn hợp lệ
              return item.userRoles.some(requiredRole =>
                userRolesList.includes(requiredRole),
              );
            })
            .map(item => (
              <Pressable
                key={item.id}
                className="w-full bg-white rounded-3xl p-5 mb-4 flex-row items-center shadow-md shadow-slate-300"
                onPress={() => handlePress(item)}
                style={({pressed}) => [
                  pressed ? {transform: [{scale: 0.98}], opacity: 0.8} : {},
                ]}>
                {/* Icon Wrapper bên trái */}
                <View
                  style={{backgroundColor: `${item.color}15`}}
                  className="w-14 h-14 rounded-2xl items-center justify-center mr-4">
                  <FontAwesomeIcon
                    icon={item.icon}
                    color={item.color}
                    size={24}
                  />
                </View>

                {/* Tiêu đề bên phải */}
                <Text
                  className="text-slate-800 font-bold text-[16px] flex-1"
                  numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SubMachineSettings;
