import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {CustomColor, device} from '../../../ults';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Toast from 'react-native-toast-message';
import {CompanyDataType} from '../type';
import {AppColors} from '../../../../colors';
type CompanyModalProps = {
  handleOpenCompanyModal: () => void;
  onSubmit: (data: CompanyDataType) => void;
  open: boolean;
  title: string;
};
const CompanyModal = (props: CompanyModalProps) => {
  const {handleOpenCompanyModal, onSubmit, open, title} = props;
  const handlecancel = () => {
    handleOpenCompanyModal();
  };

  const handleSelected = (item: CompanyDataType) => {
    onSubmit(item);
    handleOpenCompanyModal();
  };
  const CompanyDta: CompanyDataType[] = [
    {id: 1, name: 'Hai Nam'},
    {id: 2, name: 'Hai Nam'},
  ];
  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <View style={styles.centeredView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.textStyle}>{title.toUpperCase()}</Text>
              <Pressable
                style={styles.closeButton}
                onPress={handleOpenCompanyModal}>
                <FontAwesomeIcon icon={faXmark} size={18} color="black" />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              {CompanyDta.length > 0 ? (
                <View>
                  <ScrollView>
                    {CompanyDta.map((item: CompanyDataType, index: number) => {
                      return (
                        <Pressable
                          onPress={() => handleSelected(item)}
                          style={{
                            ...styles.inLine,
                            margin: 5,
                            borderColor: CustomColor.colorList.grey_2,
                            height: 40,
                            padding: 5,
                            borderRadius: 10,
                            borderWidth: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          key={index}>
                          <View style={styles.inLine}>
                            <Text style={styles.lineTitle}>Mã:</Text>
                            <Text style={{color: AppColors.primary}}>
                              {item.id}
                            </Text>
                          </View>
                          <View style={{...styles.inLine, width: '50%'}}>
                            <Text style={styles.lineTitle}>Ca:</Text>
                            <Text style={{color: AppColors.primary}}>
                              {item.name}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                <View
                  style={{
                    height: 80,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator color={AppColors.primary} size={'large'} />
                </View>
              )}

              <View style={styles.modalFooter}>
                <Pressable
                  onPress={handlecancel}
                  style={{
                    ...styles.pressableButton,
                    backgroundColor: CustomColor.colorList.red,
                  }}>
                  <Text style={styles.textPressible}>Hủy</Text>
                </Pressable>
                {/* <Pressable
                                    onPress={() => { }}
                                    style={{ ...styles.pressableButton, backgroundColor: CustomColor.colorList.green }}>
                                    <Text style={styles.textPressible}>Lưu</Text>
                                </Pressable> */}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
  },
  textStyle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalView: {
    // margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    padding: 5,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    borderBottomColor: CustomColor.colorList.grey_2,
    borderBottomWidth: 1,
    borderWidth: 0,
  },
  closeButton: {
    width: '10%',
  },
  inLine: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },
  modalBody: {
    marginTop: 10,
    width: '98%',
  },
  loadingView: {
    width: '100%',
    padding: 20,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    // gap: 5,
  },
  pressable: {
    borderColor: CustomColor.colorList.grey,
    borderWidth: 1,
    borderRadius: 999,
    padding: 10,
    margin: 5,
    width: '100%',
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  lineView: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  lineTitle: {
    fontWeight: 'bold',
  },
  inputLine: {
    borderWidth: 1,
    borderColor: CustomColor.colorList.grey_2,
    borderRadius: 10,
    height: 40,
  },
  modalFooter: {
    width: '100%',
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // flexDirection: 'row',
    // justifyContent: 'space-between'
  },
  pressableButton: {
    borderRadius: 999,
    height: 40,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPressible: {
    color: 'white',
    fontWeight: 'bold',
  },
});
export default CompanyModal;
