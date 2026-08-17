import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, Alert, Dimensions } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { loadingStore } from "../Store/loadingStore";
import { useSetRecoilState } from "recoil";
import { deleteApi } from "../Base/api/api_service__";
import Toast from "react-native-toast-message";

// Tính toán kích thước ô vuông để chia đều 4 ô trên 1 hàng (flex-wrap)
const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 32 - 36) / 4; // Toàn màn hình - padding - khoảng cách các ô (gap: 12)

interface ImageInputProps {
  maxImages?: number;
  initialImages?: any[];
  onImagesChange?: (images: any[]) => void;
}

export default function ImageInput({
  maxImages = 8,
  initialImages = [],
  onImagesChange,
}: ImageInputProps) {
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const setLoadingAtom = useSetRecoilState(loadingStore);

  // 🌟 ĐỒNG BỘ DỮ LIỆU THÔNG MINH: Chỉ nạp ảnh từ API khi số lượng ảnh cũ thay đổi
  // Tránh việc ghi đè làm mất ảnh cục bộ (local images) vừa chọn từ camera/library
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      const formattedImages = initialImages.map((img) => {
        if (typeof img === "string") return { path: img };
        return { ...img, path: img.path || img.url || img.uri };
      });

      // Chỉ cập nhật từ màn hình cha nếu số lượng ảnh có ID (ảnh từ server) thay đổi
      const serverImagesInState = selectedImages.filter((img) => img.id);
      const serverImagesInProps = formattedImages.filter((img) => img.id);

      if (
        serverImagesInState.length !== serverImagesInProps.length ||
        selectedImages.length === 0
      ) {
        // Giữ lại các ảnh local đang chờ upload (không có id) trộn với ảnh từ server đổ về
        const localImages = selectedImages.filter((img) => !img.id);
        setSelectedImages([...formattedImages, ...localImages]);
      }
    } else {
      // Nếu màn hình cha truyền vào mảng trống, nhưng ta đang có ảnh local chuẩn bị upload thì không xóa sạch
      const localImages = selectedImages.filter((img) => !img.id);
      setSelectedImages(localImages);
    }
  }, [initialImages]);

  // Hàm dùng chung để đẩy dữ liệu lên màn hình cha một cách đồng bộ
  const handleImagesUpdate = (newImagesList: any[]) => {
    setSelectedImages(newImagesList);
    if (onImagesChange) onImagesChange(newImagesList);
  };

  // 1. Hàm chụp ảnh từ Camera
  const handleCamera = () => {
    ImagePicker.openCamera({
      width: 1024,
      height: 1024,
      cropping: false,
    })
      .then((image) => {
        const newImages = [...selectedImages, image];
        handleImagesUpdate(newImages);
      })
      .catch((err) => console.log("Hủy chụp ảnh:", err.message));
  };

  // 2. Hàm chọn nhiều ảnh từ Thư viện
  const handleLibrary = () => {
    const currentCount = selectedImages.length;
    if (currentCount >= maxImages) {
      Alert.alert(
        "Thông báo",
        `Bạn chỉ được chọn tối đa ${maxImages} hình ảnh.`,
      );
      return;
    }

    ImagePicker.openPicker({
      multiple: true,
      maxFiles: maxImages - currentCount, // Giới hạn số lượng ảnh còn lại được chọn
      mediaType: "photo",
    })
      .then((images) => {
        const newImages = [...selectedImages, ...images];
        handleImagesUpdate(newImages);
      })
      .catch((err) => console.log("Hủy chọn ảnh:", err.message));
  };

  // 3. Mở Menu lựa chọn
  const handleOpenMenu = () => {
    Alert.alert("Thêm hình ảnh", "Chọn phương thức lấy hình ảnh của bạn:", [
      { text: "Hủy bỏ", style: "cancel" },
      { text: "📸 Chụp ảnh trực tiếp", onPress: handleCamera },
      { text: "🖼️ Mở thư viện ảnh", onPress: handleLibrary },
    ]);
  };

  // 4. Xóa ảnh đã chọn
  const handleRemoveImage = (item: any) => {
    // Trường hợp 1: Ảnh mới vừa chọn (chưa upload, không có item.id) -> Xóa ngay cục bộ
    if (!item.id) {
      const newImages = selectedImages.filter((img) => img.path !== item.path);
      handleImagesUpdate(newImages);
      return;
    }

    // Trường hợp 2: Ảnh cũ đã tồn tại trên Server -> Gọi API xóa thực tế
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa ảnh này khỏi hệ thống không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa ảnh",
          style: "destructive",
          onPress: async () => {
            setLoadingAtom(true);
            try {
              const url = `/qc/file/delete/${item.id}`;
              const response = await deleteApi(url);

              if (response && (response.status || response.success)) {
                Toast.show({
                  type: "success",
                  text1: "Thành công",
                  text2: "Đã xóa ảnh thành công!",
                });

                const newImages = selectedImages.filter(
                  (img) => img.id !== item.id,
                );
                handleImagesUpdate(newImages);
              } else {
                Toast.show({
                  type: "error",
                  text1: "Thất bại",
                  text2: response?.message || "Xóa ảnh thất bại",
                });
              }
            } catch (error: any) {
              console.error("❌ Lỗi xảy ra khi xóa ảnh:", error);
              Toast.show({
                type: "error",
                text1: "Thất bại",
                text2: error?.message || "Có lỗi xảy ra, vui lòng thử lại!",
              });
            } finally {
              setLoadingAtom(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="py-3 px-4 bg-white rounded-xl shadow-sm border border-gray-100 mt-2">
      <Text className="text-gray-700 font-semibold mb-2">
        Hình ảnh đính kèm ({selectedImages.length}/{maxImages}):
      </Text>
      {/* <Text style={{ fontFamily: 'monospace' }} className="text-gray-900">
                            {JSON.stringify(selectedImages, null, 2)}
                        </Text> */}
      {/* Layout dạng lưới (Grid) */}
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {/* Ô SỐ 1: NÚT THÊM ẢNH */}
        {selectedImages.length < maxImages && (
          <Pressable
            onPress={handleOpenMenu}
            style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
            className="bg-gray-100 border border-dashed border-gray-300 rounded-xl justify-center items-center active:opacity-70"
          >
            <FontAwesomeIcon icon={faPlus} size={22} color="#9ca3af" />
            <Text className="text-[10px] text-gray-400 font-medium mt-1">
              Thêm ảnh
            </Text>
          </Pressable>
        )}

        {/* CÁC Ô TIẾP THEO: HIỂN THỊ PREVIEW ẢNH ĐÃ CHỌN / CÓ SẴN */}
        {selectedImages.map((img, index) => (
          <View
            key={index}
            style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
            className="relative"
          >
            <View className="w-full h-full rounded-xl overflow-hidden bg-gray-50 border border-gray-150">
              {img.path ? (
                <Image
                  source={{ uri: img.path }}
                  style={{ width: "100%", height: "100%" }}
                  className="object-cover rounded-xl"
                />
              ) : (
                <View className="w-full h-full justify-center items-center px-1">
                  <Text
                    numberOfLines={3}
                    className="text-[10px] text-gray-500 font-medium text-center break-all"
                  >
                    {img.fileName || `Image #${img.id || index}`}
                  </Text>
                </View>
              )}
            </View>

            {/* Nút xóa ảnh góc trên bên phải */}
            <Pressable
              onPress={() => handleRemoveImage(img)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-5 h-5 justify-center items-center shadow-md active:bg-red-600"
              style={{ zIndex: 10 }}
            >
              <FontAwesomeIcon icon={faXmark} size={11} color="#ffffff" />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
