import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Button,
    UIManager,
    LayoutAnimation
} from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import { CustomColor, device } from '../../ults';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
type CollapsibleAccordionsComponentProps = {
    children: any,
    title: any;
    heighContent: number;
};
function CollapsibleAccordionsComponent(props: CollapsibleAccordionsComponentProps) {
    const { children, title, heighContent } = props;
    const [expanded, setExpanded] = useState(false);

    function toggleItem() {
        UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    }

    const body = <View style={{ ...styles.accordBody, height: heighContent }}>{children}</View>;

    return (
        <View style={styles.accordContainer}>
            <TouchableOpacity style={styles.accordHeader} onPress={toggleItem}>
                <Text style={styles.accordTitle}>{title}</Text>
                <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown}
                    size={15} color="black" />
            </TouchableOpacity>
            {expanded && body}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // width: '95%'
    },
    accordContainer: {
        // padding: 20,
        width: '98%',
        // height: 80
    },
    accordHeader: {
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderWidth: 0,
        // borderBottomWidth: 1,
        // borderColor: CustomColor.colorList.grey,
        // borderRadius: 20
    },
    accordTitle: {
        fontSize: 16,
        // color: '#000',
        color: CustomColor.colorList.grey
    },
    accordBody: {
        paddingTop: 5,
        // height: 300
    },
    textSmall: {
        fontSize: 16
    },
    seperator: {
        height: 12
    }
});

export default CollapsibleAccordionsComponent;