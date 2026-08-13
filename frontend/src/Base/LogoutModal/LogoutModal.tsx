import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, View, Text, Pressable, TextInput, Keyboard, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { CustomColor } from "../../ults";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../../Pages/Login/store/userAtom";
type LogoutModalProps = {
    open: boolean;
};
const LogoutModal = (props: LogoutModalProps) => {
    const setUserStore = useSetRecoilState(userAtom);
    const handleLogout = () => {
        AsyncStorage.removeItem('storeUSerData').then(() => {
            console.log('tokenId reset successfully');
            setUserStore({
                tokenID: null,
                ClientID: 0,
                userName: '',
                companySiteID: 0
            });
        });
    };
    return (
        <Modal animationType="slide"
            transparent={true}
            visible={props.open}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>

                    <View style={styles.modalBody}>
                        <Text>Vui lòng đăng nhập lại để tiếp tục</Text>
                        <View>
                            <Pressable onPress={handleLogout}>
                                <Text>Đăng xuất</Text>
                            </Pressable>
                        </View>
                    </View>
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
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
        padding: 10
    },
    closeButton: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        height: 40
    },
    modalBody: {
        marginTop: 10,
        width: '100%'
    },
    loadingView: {
        width: '100%',
        padding: 20
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
        width: '95%',
        display: 'flex',
        // justifyContent: 'center',
        alignItems: 'center'
    }
});

export default LogoutModal;