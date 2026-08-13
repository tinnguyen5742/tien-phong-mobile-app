import {
  View,
  Text,
  TouchableOpacity,
  DeviceEventEmitter,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import HeaderComponent from '../../Base/HeaderComponent/headerComponent';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import HoneywellScanner from '../../Base/ScannerModule';
import {DetailProductStyle} from './DetailProductStyle';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {CustomColor} from '../../ults';

export const DetailProduct = () => {
  const navigate = useNavigation();
  const [qrcode, setQrcode] = useState('');
  const [debouncedQrcode, setDebouncedQrcode] = useState('');

  useEffect(() => {
    if (HoneywellScanner.isCompatible) {
      HoneywellScanner.startReader();

      const subscription = DeviceEventEmitter.addListener(
        'barcodeReadSuccess',
        result => {
          const scannedQRCode = result.data;

          setQrcode(scannedQRCode);

          // Tách mã vật tư và số lô từ QR code
        },
      );

      return () => {
        HoneywellScanner.stopReader();
        subscription.remove();
      };
    }
  }, [qrcode]);

  const handleBack = () => {
    // setLineIndexItem(-1);
    navigate.goBack();
  };
  const handleClearQrcode = () => {
    setQrcode('');
  };

  const handleChangeInput = (value: any) => {
    setQrcode(value);
  };
  return (
    <View style={DetailProductStyle.inventory}>
      <HeaderComponent
        backButton={true}
        handleBack={handleBack}
        iconRight={
          <TouchableOpacity onPress={() => {}}>
            {/* <FontAwesomeIcon icon={faSave} size={25} color={AppColors.primary} /> */}
          </TouchableOpacity>
        }
        title="Thông tin sản phẩm"
        // handleRightIconButton={handleRightIconButton}
      />
      <View>
        <ScrollView>
          <View style={DetailProductStyle.headerLine}>
            <View style={DetailProductStyle.groupHeaderItem}>
              <View
                style={{
                  ...DetailProductStyle.headerRef,
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    ...DetailProductStyle.headerText,
                    fontWeight: 'bold',
                    width: 80,
                  }}>
                  QRcode:{' '}
                </Text>
                <View style={DetailProductStyle.textInputWithButton}>
                  <TextInput
                    onChangeText={text => handleChangeInput(text)}
                    value={qrcode}
                    // style={{ ...DetailProductStyle.warehousePressible, borderColor: CustomColor.colorList.grey, width: 260 }}
                    placeholder="Vui lòng scan qrcode"
                  />
                  <Pressable
                    onPress={handleClearQrcode}
                    style={DetailProductStyle.iconPressable}>
                    <FontAwesomeIcon
                      icon={faXmark}
                      size={18}
                      color={CustomColor.colorList.grey}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>LSX</Text>
            <Text style={DetailProductStyle.textWarehouseView}>LSX</Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Khách hàng</Text>
            <Text style={DetailProductStyle.textWarehouseView}>Khách hàng</Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Mã sản phẩm</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Mã sản phẩm
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Công đoạn</Text>
            <Text style={DetailProductStyle.textWarehouseView}>Công đoạn</Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Hình thức ghép</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Hình thức ghép
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Ngày sản xuất</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Ngày sản xuất
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Giờ sản xuất</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Giờ sản xuất
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Ca sản xuất</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Ca sản xuất
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Máy sản xuất</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              máy sản xuất
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Mã cuộn</Text>
            <Text style={DetailProductStyle.textWarehouseView}>Mã cuộn</Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Số MD</Text>
            <Text style={DetailProductStyle.textWarehouseView}>Số MD</Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Số mối nối</Text>
            <Text style={DetailProductStyle.textWarehouseView}>Số mối nối</Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Bỏ buồng sấy</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Bỏ buồng sấy
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Thời gian công nghệ</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Thời gian công nghệ
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Ngày bắt đầu</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Ngày bắt đầu
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Giò bắt đầu</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Giò bắt đầu
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Ngày kết thúc</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Ngày kết thúc
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Giờ kết thúc</Text>
            <Text style={DetailProductStyle.textWarehouseView}>
              Giờ kết thúc
            </Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Tổng giờ</Text>
            <Text style={DetailProductStyle.textWarehouseView}>Tổng giờ</Text>
          </View>
          <View style={DetailProductStyle.warehouseView}>
            <Text style={DetailProductStyle.left}>Ghi chú</Text>
            <Text style={DetailProductStyle.textWarehouseView}>Ghi chú</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
