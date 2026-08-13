import React, {useEffect} from 'react';
import {LogBox, StatusBar, View, Appearance, Platform} from 'react-native';

import {useColorScheme} from 'nativewind';
import {RecoilRoot} from 'recoil';
import Toast, {ErrorToast, SuccessToast} from 'react-native-toast-message';

import AppNavigate from './src';
import {CustomColor} from './src/ults';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

function App(): JSX.Element {
  const {colorScheme, setColorScheme} = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  LogBox.ignoreLogs(['new NativeEventEmitter']);

  // Đồng bộ theme và set màu Navigation Bar
  useEffect(() => {
    // 🌟 ÉP NATIVEWIND LUÔN CHẠY LIGHT MODE
    setColorScheme('light');

    if (Platform.OS === 'android') {
      try {
        // Ép nền màu trắng + icon MÀU ĐEN (true)
        changeNavigationBarColor('#ffffff', true, false);
      } catch (e) {
        console.log('Lỗi set NavigationBar:', e);
      }
    }
  }, []); // Chỉ chạy 1 lần khi mở App

  const toastConfig = {
    success: (props: any) => (
      <SuccessToast
        {...props}
        style={{
          width: '90%',
          borderLeftColor: CustomColor.colorList.green,
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          marginTop: 10,
        }}
        contentContainerStyle={{paddingHorizontal: 15}}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#1e293b',
        }}
        text2Style={{
          fontSize: 14,
          color: isDarkMode ? '#cbd5e1' : '#64748b',
        }}
        text2NumberOfLines={4}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          width: '90%',
          borderLeftColor: CustomColor.colorList.red,
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          marginTop: 10,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#1e293b',
        }}
        text2Style={{
          fontSize: 14,
          color: isDarkMode ? '#cbd5e1' : '#64748b',
        }}
      />
    ),
  };

  return (
    <RecoilRoot>
      <SafeAreaProvider className="flex-1 bg-slate-50 dark:bg-slate-900">
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#0f172a' : '#f8fafc'}
        />

        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
          <AppNavigate />
        </View>

        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </RecoilRoot>
  );
}

export default App;
