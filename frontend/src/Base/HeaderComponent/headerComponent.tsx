import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppColors} from '../../../colors';
type HeaderComponentProps = {
  backButton: any;
  title: string;
  handleRightIconButton?: () => void;
  handleBack: () => void;
  iconRight: any;
};

const HeaderComponent = (props: HeaderComponentProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{paddingTop: insets.top}} className="w-full">
      <View className="h-[60px] w-full flex-row justify-between items-center p-[5px] bg-white shadow-md">
        <View className="flex-row items-center justify-center">
          {props.backButton ? (
            <TouchableOpacity className="mr-[10px]" onPress={props.handleBack}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                size={25}
                color={AppColors.primary}
              />
            </TouchableOpacity>
          ) : null}
          <Text
            className="text-[18px] font-bold"
            style={{color: AppColors.primary}} // Giữ style này nếu màu sắc lấy động từ file ults
          >
            {props.title}
          </Text>
        </View>

        <View>{props.iconRight}</View>
      </View>
    </View>
  );
};

export default HeaderComponent;
