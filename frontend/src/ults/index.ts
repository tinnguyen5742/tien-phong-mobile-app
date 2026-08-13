import { Platform, Dimensions } from 'react-native';

export const device = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    os: Platform.OS
};

export const CustomColor = {
    logoColor: '#f7ef22',
    defaultColor: '#DED846',
    colorList: {
        black: '#191B26',
        grey: '#666666',
        grey_2: '#e3e5e8',
        blue: '#005f78',
        green: '#32B85F',
        green_2: '#a6f3c5',
        green_3: '#dafbe6',
        yellow: '#FFB300',
        red: '#FF5C5C',
        pink: '#f47b81',
        shadowWhite: '#FFF4F4',
        shadowYellow: '#FFFBEF',
        shadowBlue: '#EFF3F9',
        shadowBlue2: '#A6B2DD',
        shadowPurple: '#DCE0FF',
    }
};

export const formatMonth = (date: Date) => {
    return date.getMonth() + 1 + '/' + date.getFullYear();
};

export const formatDate = (date: Date) => {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
};
// export const formatTime = (date: Date) => {
//     return date.getHours() + ':' + date.getMinutes();
// };
export const formatTime = (
    dateString: string | Date | null | undefined,
    includeSeconds: boolean = true
): string => {
    if (!dateString) return "--:--";

    try {
        const date = new Date(dateString);

        // Kiểm tra tính hợp lệ của Date
        if (isNaN(date.getTime())) return "--:--";

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        if (includeSeconds) {
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`; // Kết quả: 17:35:25
        }

        return `${hours}:${minutes}`; // Kết quả: 17:35
    } catch (error) {
        console.error("❌ Lỗi formatTimeOnly:", error);
        return "--:--";
    }
};

export const formatDecimalFour = (value: any): string => {
    if (value === undefined || value === null || value === '') return '0.0000';
    
    // Ép kiểu về số, nếu không phải số hợp lệ thì trả về 0.0000
    const num = Number(value);
    if (isNaN(num)) return '0.0000';
    
    // Ép hiển thị cố định 4 chữ số thập phân
    return num.toFixed(4);
};

export const combineDateAndTime = (
    dateObj: Date | string | undefined, 
    timeObj: Date | string | undefined
): string => {
    // 1. Xử lý Date Object (Lấy Ngày/Tháng/Năm)
    const d = dateObj ? new Date(dateObj) : new Date();
    const targetDate = isNaN(d.getTime()) ? new Date() : d;

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');

    // Mặc định ban đầu lấy giờ phút hiện tại
    let hours = String(new Date().getHours()).padStart(2, '0');
    let minutes = String(new Date().getMinutes()).padStart(2, '0');
    let seconds = "00";

    // 2. Xử lý Time Object (Chấp nhận cả Date, ISO string, hoặc chuỗi thuần "08:19:00")
    if (timeObj) {
        if (timeObj instanceof Date) {
            hours = String(timeObj.getHours()).padStart(2, '0');
            minutes = String(timeObj.getMinutes()).padStart(2, '0');
            seconds = String(timeObj.getSeconds()).padStart(2, '0');
        } else if (typeof timeObj === 'string') {
            // Sử dụng Regex để kiểm tra xem chuỗi có phải dạng chỉ có giờ: "HH:mm:ss" hoặc "HH:mm" không
            const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/;
            const match = timeObj.trim().match(timeRegex);

            if (match) {
                // Nếu khớp chuỗi "08:19:00" -> bóc tách trực tiếp
                hours = match[1].padStart(2, '0');
                minutes = match[2].padStart(2, '0');
                seconds = match[3] ? match[3].padStart(2, '0') : "00";
            } else {
                // Nếu là chuỗi ISO hoàn chỉnh hoặc định dạng Date String khác
                const t = new Date(timeObj);
                if (!isNaN(t.getTime())) {
                    hours = String(t.getHours()).padStart(2, '0');
                    minutes = String(t.getMinutes()).padStart(2, '0');
                    seconds = String(t.getSeconds()).padStart(2, '0');
                }
            }
        }
    }

    // 🎉 Trả về định dạng chuỗi ISO Local sạch (Không chứa chữ Z)
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const combineDateWithCurrentTime = (inputDate: string | Date | null | undefined): string => {
    const targetDate = inputDate ? new Date(inputDate) : new Date();
    const now = new Date(); // Lấy mốc thời gian thực tế ngay lúc gọi hàm

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    
    // Lấy giờ, phút, giây, mili-giây hiện tại của thiết bị
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');

    // Trả về định dạng đúng yêu cầu: YYYY-MM-DDTHH:mm:ss.sss
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
};

export const formatStringUpcase = (text: string) => {
    return text.toUpperCase();
};
// export const printerConfig = {
//     // ip: '192.168.1.42'
//     ip: '192.168.0.116'
// };

export const capitalizeFieldNames = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(capitalizeFieldNames); // Xử lý từng phần tử trong mảng
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1); // In hoa chữ cái đầu
            acc[capitalizedKey] = capitalizeFieldNames(value); // Đệ quy cho giá trị
            return acc;
        }, {} as any);
    }
    return obj; // Giữ nguyên các kiểu dữ liệu khác
};

const appendImagesToFormData = (formData: FormData, images: any[], keyName: string = 'images') => {
    if (!images || images.length === 0) return;

    images.forEach((image, index) => {
        const fileUri = image.path;
        if (!fileUri) return;

        // Cắt lấy tên file từ đường dẫn tạm (Ví dụ: "image_123.jpg")
        const fileName = fileUri.split('/').pop(); 

        // Khai báo cấu trúc Object File theo quy chuẩn mã Native của React Native
        formData.append(keyName, {
            uri: fileUri,
            name: fileName || `qc_image_${index}.jpg`,
            type: image.mime || 'image/jpeg',
        } as any); // Sử dụng 'as any' để bypass qua lớp type check nghiêm ngặt của TS
    });
};


export const urlUpdateApp = 'https://hainam.logit.id.vn/hainam_apk_update/app-release.apk';