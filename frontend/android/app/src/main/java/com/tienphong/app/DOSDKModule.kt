package com.qr_rn.dosdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.OutputStream
import java.net.Socket

class DOSDKModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DOSDK"
    }

    // Phương thức in qua WiFi
    @ReactMethod
    fun printViaWifi(ip: String, port: Int, data: String, promise: Promise) {
        Thread {
            try {
                // Kết nối đến máy in qua WiFi sử dụng IP và cổng
                val socket = Socket(ip, port)
                val outputStream: OutputStream = socket.getOutputStream()

                // Gửi lệnh ESC/POS đến máy in
                val initCommand = byteArrayOf(0x1B, 0x40) // Lệnh khởi tạo máy in
                val printText = data.toByteArray() // Nội dung cần in
                val cutPaperCommand = byteArrayOf(0x1D, 0x56, 0x41) // Lệnh cắt giấy

                // Gửi lệnh đến máy in
                outputStream.write(initCommand)
                outputStream.write(printText)
                outputStream.write(cutPaperCommand)

                // Đóng luồng và socket
                outputStream.flush()
                outputStream.close()
                socket.close()

                promise.resolve("In thành công qua WiFi")

            } catch (e: Exception) {
                e.printStackTrace()
                promise.reject("PRINT_ERROR", "Lỗi khi in qua WiFi: ${e.message}")
            }
        }.start()
    }
}
