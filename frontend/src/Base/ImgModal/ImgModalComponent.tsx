import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, View, Text, Pressable, TextInput, Keyboard, ActivityIndicator, Image } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { CustomColor } from "../../ults";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons';

type ImgModalProps = {
    open: boolean;
    handleInputModal: () => void;
};
const ImgModal = (props: ImgModalProps) => {

    return (
        <Modal animationType="slide"
            transparent={true}
            visible={props.open}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.closeButton}>

                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>HÌNH ẢNH</Text>
                        <Pressable
                            onPress={props.handleInputModal}>
                            <FontAwesomeIcon icon={faXmark} size={20} color="black" />
                        </Pressable>
                    </View>
                    <View style={styles.modalBody}>
                        <Image alt="img_modal" source={require('../../assets/imgs/TA_001_demojpg.jpg')} />
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
        padding: 10
    },
    modalBody: {
        marginTop: 10,
        width: '100%'
    },
});

export default ImgModal;