import { NativeModules, NativeEventEmitter } from 'react-native';

const { HoneywellScanner } = NativeModules;

/**
 * Listen for available events
 * @param  {String} eventName Name of event one of barcodeReadSuccess, barcodeReadFail
 * @param  {Function} handler Event handler
 */

const barcodeReaderEmitter = new NativeEventEmitter(HoneywellScanner);

var subscriptionBarcodeReadSuccess: any = null;
var subscriptionBarcodeReadFail: any = null;

HoneywellScanner.onBarcodeReadSuccess = (handler: any) => {
    subscriptionBarcodeReadSuccess?.remove();
    subscriptionBarcodeReadSuccess = null;
    subscriptionBarcodeReadSuccess = barcodeReaderEmitter.addListener(HoneywellScanner.BARCODE_READ_SUCCESS, handler);
};

HoneywellScanner.onBarcodeReadFail = (handler: any) => {
    subscriptionBarcodeReadFail?.remove();
    subscriptionBarcodeReadFail = null;
    subscriptionBarcodeReadFail = barcodeReaderEmitter.addListener(HoneywellScanner.BARCODE_READ_FAIL, handler);
};

/**
 * Stop listening for event
 * @param  {String} eventName Name of event one of barcodeReadSuccess, barcodeReadFail
 * @param  {Function} handler Event handler
 */
HoneywellScanner.offBarcodeReadSuccess = () => {
    subscriptionBarcodeReadSuccess?.remove();
};
HoneywellScanner.offBarcodeReadFail = () => {
    subscriptionBarcodeReadFail?.remove();
};

export default HoneywellScanner;