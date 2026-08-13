import React, {useEffect, useRef, useState} from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Image,
} from 'react-native';
import {CustomColor, device} from '../../ults';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {AppColors} from '../../../colors';

type LoadingComponentProps = {
  open: boolean;
};
const LoadingComponent = (props: LoadingComponentProps) => {
  return (
    <Modal animationType="slide" transparent={true} visible={props.open}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ActivityIndicator color={AppColors.primary} size={'large'} />
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'rgba(204, 204, 204, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //     width: 0,
    //     height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
    width: '100%',
    height: device.height,
    justifyContent: 'center',
    // padding: 10
  },
  closeButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    padding: 10,
  },
  modalBody: {
    marginTop: 10,
    width: '100%',
  },
});

export default LoadingComponent;
