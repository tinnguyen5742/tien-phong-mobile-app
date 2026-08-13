import {StyleSheet} from 'react-native';
import {CustomColor, device} from '../../../ults';
import {AppColors} from '../../../../colors';

export const ListStyles = StyleSheet.create({
  listView: {
    width: device.width,
    height: device.height,
    // backgroundColor: CustomColor.colorList.shadowWhite
  },
  viewTable: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'black'
  },
  table: {
    // width: device.width * 0.99,
    height: device.height * 0.8,
    padding: 5,
    // borderWidth: 1,
    // borderColor: 'black'
  },
  headerTable: {
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',
    padding: 2,
    marginBottom: 1,
    justifyContent: 'space-between',
    backgroundColor: CustomColor.colorList.shadowBlue,
    borderColor: AppColors.primary,
    borderWidth: 1,
    borderRadius: 5,
    height: 45,
    alignItems: 'center',
  },
  rowTable: {
    borderRadius: 5,
    width: '100%',
    height: 50,
    backgroundColor: CustomColor.colorList.shadowPurple,
    marginBottom: 5,
    // padding: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textRowTable: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  headerCell: {
    alignItems: 'center',
  },
  navigateView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
  },
  buttonNavigate: {
    borderRadius: 10,
    backgroundColor: AppColors.primary,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  textViewNavigate: {
    borderRadius: 10,
    width: 80,
    height: 40,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textNavigate: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInputWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CustomColor.colorList.grey,
    borderRadius: 8,
    height: 45,
    width: 260,
  },
  iconPressable: {
    width: 45,
    height: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: CustomColor.colorList.grey,
  },
  headerRef: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    padding: 5,
    width: '100%',
  },
  headerText: {
    fontSize: 15,
  },
  oneLine: {
    display: 'flex',
    flexDirection: 'row',
    // width: "100%"
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    height: 'auto',
  },
});
