import React, {useEffect, useState} from 'react';
import {Modal, View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RNCamera} from 'react-native-camera';
import Toast from 'react-native-toast-message';
import {CustomColor} from '../../ults';
import {AppColors} from '../../../colors';

interface Props {
  children: React.ReactNode;
  openModal: boolean;
  handleModal: (visible: boolean) => void;
  onGetData: (data: string) => void;
}

const CameraScannerWrapper = ({
  children,
  openModal,
  handleModal,
  onGetData,
}: Props) => {
  const handleReadQRCode = (event: any) => {
    const qrData = event.data;
    handleModal(false);
    onGetData(qrData);
    Toast.show({
      type: 'success',
      text1: 'Đã quét mã QR thành công!',
      text2: qrData,
    });
  };

  return (
    <View style={{flex: 1}}>
      {children}

      <Modal
        visible={openModal}
        animationType="slide"
        onRequestClose={() => handleModal(false)}>
        <View style={styles.modalContainer}>
          <QRCodeScanner
            onRead={handleReadQRCode}
            flashMode={RNCamera.Constants.FlashMode.auto}
            showMarker={true}
            reactivate={true}
            reactivateTimeout={1500}
            cameraStyle={styles.camera}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => handleModal(false)}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CameraScannerWrapper;
