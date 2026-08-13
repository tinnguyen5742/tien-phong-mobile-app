import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useRecoilState} from 'recoil';
import {userAtom} from '../Login/store/userAtom';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowRightToBracket,
  faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
const SubProduceNavigate = () => {
  const navigate = useNavigation();
  const [userStore, setUserStore] = useRecoilState(userAtom);
  const handleBack = () => navigate.goBack();
  const menuItems = [
    {
      id: 1,
      title: 'Ghi nhận Đầu vào (Nguyên vật liệu & BTP đầu vào)',
      icon: faArrowRightToBracket,
      screen: 'InputProduce',
      color: '#4F46E5',
    },
    {
      id: 2,
      title: 'Ghi nhận Đầu ra (BTP/TP đầu ra)',
      icon: faArrowRightFromBracket,
      screen: 'OutputProduce',
      color: '#10B981',
    },
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
        title="Ghi nhận sản xuất"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 16, paddingBottom: 40}}>
        {/* Grid System: flex-row và flex-wrap để tự động xuống hàng */}
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map(item => (
            <Pressable
              key={item.id}
              // w-[47%]: chia 2 cột với khoảng cách ở giữa
              // active:scale-95: hiệu ứng lún xuống khi bấm (chỉ có trong NativeWind)
              className="w-full bg-white rounded-3xl p-6 mb-4 items-center justify-center shadow-md shadow-slate-300"
              onPress={() => handlePress(item)}
              style={({pressed}) => [
                pressed ? {transform: [{scale: 0.95}], opacity: 0.8} : {},
              ]}>
              {/* Icon Wrapper với màu nền nhạt (opacity 10) */}
              <View
                style={{backgroundColor: `${item.color}15`}}
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3">
                <FontAwesomeIcon
                  icon={item.icon}
                  color={item.color}
                  size={28}
                />
              </View>

              <Text
                className="text-slate-800 font-bold text-center text-[16px] h-[40px] leading-[20px]"
                numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SubProduceNavigate;
