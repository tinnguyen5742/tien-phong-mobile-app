package com.tienphong.app

import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.honeywell.aidc.*
import com.honeywell.aidc.AidcManager.CreatedCallback
import java.util.Locale


class HoneywellScannerModule(private val reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(
        reactContext
    ),
    BarcodeReader.BarcodeListener, LifecycleEventListener {
    private var manager: AidcManager? = null
    private var reader: BarcodeReader? = null
    private var isReaderClaimed = false

    init {
        Log.d(HoneyWellTAG, "Sending event: " + "HoneywellScannerModule")
        reactContext!!.addLifecycleEventListener(this)
    }

    // Thêm phương thức này để gửi sự kiện quét về JavaScript
    private fun sendScanEvent() {
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("onPhysicalButtonPress", null)
    }

    override fun getName(): String {
        return "HoneywellScanner"
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext!!.hasActiveCatalystInstance()) {
            if (D) Log.d(
                HoneyWellTAG,
                "Sending event: $eventName"
            )
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    override fun onBarcodeEvent(barcodeReadEvent: BarcodeReadEvent) {
        if (D) Log.d(HoneyWellTAG, "HoneywellBarcodeReader - Barcode scan read")
        val params = Arguments.createMap()
        params.putString("data", barcodeReadEvent.getBarcodeData())
        Log.d(
            HoneyWellTAG,
            "HoneywellBarcodeReader - Barcode params: $params"
        )
        sendEvent(BARCODE_READ_SUCCESS, params)
    }

    override fun onFailureEvent(barcodeFailureEvent: BarcodeFailureEvent?) {
        if (D) Log.d(HoneyWellTAG, "HoneywellBarcodeReader - Barcode scan failed")
        sendEvent(BARCODE_READ_FAIL, null)
    }

    @ReactMethod
    fun startReader() {
        Log.d(HoneyWellTAG, "HoneywellBarcodeReader - startReader")
        Log.d(
            HoneyWellTAG,
            "HoneywellBarcodeReader reactContext: $reactContext"
        )
        if (reactContext != null) {
            AidcManager.create(reactContext, object : CreatedCallback {
                override fun onCreated(aidcManager: AidcManager?) {
                    manager = aidcManager
                    try {
                        reader = manager?.createBarcodeReader()
                        if (reader != null) {
                            reader!!.addBarcodeListener(this@HoneywellScannerModule)
                            try {
                                reader!!.claim()
                                isReaderClaimed = true
                                reader!!.setProperty(BarcodeReader.PROPERTY_EAN_8_ENABLED, true)
                                reader!!.setProperty(
                                    BarcodeReader.PROPERTY_EAN_8_CHECK_DIGIT_TRANSMIT_ENABLED,
                                    true
                                )
                                reader!!.setProperty(BarcodeReader.PROPERTY_EAN_13_ENABLED, true)
                                reader!!.setProperty(
                                    BarcodeReader.PROPERTY_EAN_13_CHECK_DIGIT_TRANSMIT_ENABLED,
                                    true
                                )
                                reader!!.setProperty(
                                    BarcodeReader.PROPERTY_EAN_13_TWO_CHAR_ADDENDA_ENABLED,
                                    true
                                )
                                reader!!.setProperty(
                                    BarcodeReader.PROPERTY_EAN_13_FIVE_CHAR_ADDENDA_ENABLED,
                                    true
                                )
                            } catch (e: ScannerUnavailableException) {
                                e.printStackTrace()
                            } catch (e: UnsupportedPropertyException) {
                                e.printStackTrace()
                            }
                        }
                    } catch (e: InvalidScannerNameException) {
                        e.printStackTrace()
                    }
                }
            })
        }
    }

    @ReactMethod
    fun stopReader() {
        Log.d(HoneyWellTAG, "HoneywellBarcodeReader - stopReader")
        Log.d(
            HoneyWellTAG,
            "HoneywellBarcodeReader reader!!$reader"
        )
        if (reader != null) {
            if (isReaderClaimed) {
                reader!!.release()
                isReaderClaimed = false
            }
            reader!!.close()
        }
        if (manager != null) {
            manager!!.close()
        }
    }

    override fun getConstants(): Map<String, Any>? {
        Log.d(HoneyWellTAG, "HoneywellBarcodeReader - getConstants")
        val constants: MutableMap<String, Any> = HashMap()
        constants["BARCODE_READ_SUCCESS"] = BARCODE_READ_SUCCESS
        constants["BARCODE_READ_FAIL"] = BARCODE_READ_FAIL
        constants["isCompatible"] = isCompatible
        return constants
    }

    private val isCompatible: Boolean
        private get() = Build.BRAND.lowercase(Locale.getDefault()).contains("honeywell")

    override fun onHostResume() {
        Log.d(HoneyWellTAG, "HoneywellBarcodeReader - onHostResume")
        if (reader != null && !isReaderClaimed) {
            try {
                reader!!.claim()
                isReaderClaimed = true
            } catch (e: ScannerUnavailableException) {
                e.printStackTrace()
            }
        }
    }

    override fun onHostPause() {
        Log.d(HoneyWellTAG, "HoneywellBarcodeReader - onHostPause")
        if (reader != null && isReaderClaimed) {
            reader!!.release()
            isReaderClaimed = false
        }
    }

    override fun onHostDestroy() {
        Log.d(HoneyWellTAG, "HoneywellBarcodeReader - onHostDestroy")
        if (reader != null) {
            reader!!.close()
            reader = null
        }
        if (manager != null) {
            manager?.close()
            manager = null
        }
    }

    companion object {
        private const val D = true
        private const val HoneyWellTAG = "HoneywellBarcodeReader"
        private const val BARCODE_READ_SUCCESS = "barcodeReadSuccess"
        private const val BARCODE_READ_FAIL = "barcodeReadFail"
    }
}

