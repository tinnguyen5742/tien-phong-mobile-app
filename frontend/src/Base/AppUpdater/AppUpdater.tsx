import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import IntentLauncher from 'react-native-intent-launcher';
import { urlUpdateApp } from '../../ults';

const AppUpdater = () => {
    useEffect(() => {
        checkForUpdate();
    }, []);

    const checkForUpdate = async () => {
        try {
            // Gọi API để lấy thông tin phiên bản mới nhất
            const response = await fetch(urlUpdateApp);
            const data = await response.json();

            const currentVersion = '1.0.0'; // Thay bằng phiên bản hiện tại của ứng dụng
            if (data.version > currentVersion) {
                Alert.alert(
                    'Cập nhật mới',
                    `Phiên bản ${data.version} đã có sẵn. Bạn có muốn tải xuống không?`,
                    [
                        { text: 'Hủy', style: 'cancel' },
                        { text: 'Đồng ý', onPress: () => downloadAndInstallApk(data.apkUrl) },
                    ]
                );
            }
        } catch (error) {
            console.error('Lỗi kiểm tra cập nhật:', error);
            Alert.alert('Lỗi', 'Không thể kiểm tra cập nhật. Vui lòng thử lại sau.');
        }
    };

    const downloadAndInstallApk = async (apkUrl: any) => {
        try {
            // Kiểm tra quyền lưu trữ
            const permission = await checkPermission();

            if (!permission) {
                Alert.alert('Lỗi quyền', 'Không có quyền lưu trữ. Không thể tải tệp.');
                return;
            }

            // Tải xuống APK
            const downloadDest = `${RNFS.DownloadDirectoryPath}/hainam.apk`;
            console.log('Đang tải xuống file:', downloadDest);

            const result = await RNFS.downloadFile({
                fromUrl: apkUrl,
                toFile: downloadDest,
            }).promise;

            // Kiểm tra xem tệp đã được tải xuống thành công hay chưa
            const fileExists = await RNFS.exists(downloadDest);
            if (fileExists) {
                Alert.alert('Tải xuống thành công!', 'Bắt đầu cài đặt.');
                installApk(downloadDest);
            } else {
                console.error('File không tồn tại sau khi tải xuống.');
                Alert.alert('Tải xuống thất bại!', 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi tải tệp:', error);
            Alert.alert('Lỗi', 'Không thể tải tệp. Vui lòng thử lại.');
        }
    };


    const checkPermission = async () => {
        try {
            const permission =
                Platform.OS === 'android'
                    ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
                    : PERMISSIONS.IOS.PHOTO_LIBRARY;

            const status = await check(permission);

            if (status === RESULTS.GRANTED) {
                return true;
            }

            const result = await request(permission);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.error('Lỗi kiểm tra quyền:', error);
            return false;
        }
    };

    const installApk = (filePath: string) => {
        if (Platform.OS === 'android') {
            try {
                IntentLauncher.startActivity({
                    action: 'android.intent.action.VIEW',
                    data: `file://${filePath}`,
                    type: 'application/vnd.android.package-archive',
                    flags: 1,
                });
            } catch (error) {
                console.error('Lỗi cài đặt APK:', error);
                Alert.alert('Lỗi', 'Không thể cài đặt ứng dụng. Vui lòng thử lại.');
            }
        } else {
            Alert.alert('Không hỗ trợ', 'Cài đặt không hỗ trợ trên iOS.');
        }
    };

    return null;
};

export default AppUpdater;
