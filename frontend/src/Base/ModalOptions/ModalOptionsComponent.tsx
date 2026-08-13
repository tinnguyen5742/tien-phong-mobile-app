import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, View, Text, Pressable, TextInput, Keyboard, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { CustomColor } from "../../ults";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
type ModalOptionsProps = {
    data: any;
    getDataModalOptions: (data: any) => void;
    open: boolean;
    handleInputModal: () => void;
    title: string;
    name: string;
};
const ModalOptions = (props: ModalOptionsProps) => {

    return (
        <Modal animationType="slide"
            transparent={true}
            visible={props.open}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.closeButton}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{props.title}</Text>
                        <TouchableOpacity onPress={props.handleInputModal} style={{ width: 40, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <FontAwesomeIcon icon={faXmark} size={18} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalBody}>
                        {
                            (props.data && props.data.length > 0) ?
                                <ScrollView style={{ minHeight: 120, maxHeight: 300 }}>
                                    <View style={styles.options}>
                                        {
                                            props.data.map((item: any, index: number) => {
                                                return (
                                                    <Pressable
                                                        style={styles.pressable}
                                                        key={index}
                                                        onPress={() => props.getDataModalOptions(item)}>
                                                        <Text>{item[props.name]}</Text>
                                                    </Pressable>
                                                );
                                            })
                                        }
                                    </View>
                                </ScrollView> :
                                <View style={styles.loadingView}>
                                    <ActivityIndicator size="large" color="blue" />
                                </View>
                        }
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

export default ModalOptions;