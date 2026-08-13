//Db DuyNhat_daotao
// export const api_url = 'https://nmt.logit.id.vn/duynhat_api/v1';

// api local test
// export const api_url = 'http://192.168.1.205:4045/api/v1';
// export const api_url = 'http://192.168.1.205:4045/api/v2';
//server duynhat patsoft
// export const api_url = 'http://42.1.111.50:4045/api/v1';
export const api_url = 'http://42.1.111.50:4045/api/v2';

//db HaiNam
// export const api_url = 'http://42.1.111.50:4044/api/v1';

//db HN_test
// export const api_url = 'http://42.1.111.50:4045/api/v1';

import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hàm Helper nội bộ để lấy baseUrl dựa trên phiên bản API (v1 hoặc v2) KHÔNG DÙNG NỮA
 */
// const getBaseUrl = (version: 'v1' | 'v2') => {
//   return version === 'v2' ? api_url_v2 : api_url;
// };

/**
 * Hàm Helper nội bộ để lấy Token của user từ bộ nhớ thiết bị
 */
const getAccessToken = async (): Promise<string | null> => {
  try {
    const userRaw = await AsyncStorage.getItem('storeUSerData');
    if (!userRaw) return null;
    const userData = JSON.parse(userRaw);
    return userData?.tokenID || null;
  } catch (error) {
    console.error('Lỗi truy cập AsyncStorage:', error);
    return null;
  }
};

/**
 * Hàm Helper nội bộ để xử lý Phản hồi (Response) và Bẫy lỗi từ Fetch
 */
const handleFetchResponse = async (response: Response) => {
  // 🌟 1. BẪY LỖI 401 NGAY TẠI ĐÂY (Kiểm tra mã trạng thái HTTP Status trước)
  if (response.status === 401) {
    const errorMsg = 'Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.';
    Toast.show({
      type: 'error',
      text1: 'Hết hạn phiên',
      text2: errorMsg,
    });
    throw {message: errorMsg, status: 401};
  }

  // Nếu HTTP Status không phải là 2xx (ví dụ 400, 500...)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // 🌟 2. PHÒNG HỜ: Nếu server trả về 200/400 nhưng cấu trúc dữ liệu JSON có chứa text "Unauthorized"
    if (errorData?.Message === 'Unauthorized.') {
      const errorMsg = 'Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.';
      Toast.show({
        type: 'error',
        text1: 'Hết hạn phiên',
        text2: errorMsg,
      });
      throw {message: errorMsg, status: 401};
    }

    throw {
      message: errorData?.Message || `Lỗi hệ thống (${response.status})`,
      status: response.status,
    };
  }
  return await response.json();
};

/**
 * Hàm Helper nội bộ để xử lý lỗi mạng vật lý (Catch Block)
 */
const handleFetchError = (error: any, apiName: string) => {
  if (error.status) throw error; // Lỗi đã cấu trúc (bao gồm cả 401 bên trên) thì quăng tiếp ra ngoài

  console.error(`❌ Lỗi kết nối mạng tại ${apiName}:`, error.message);
  let errorMsg = 'Không thể kết nối đến máy chủ';
  if (error.message === 'Failed to fetch') {
    errorMsg = 'Lỗi kết nối mạng hoặc sai địa chỉ IP máy chủ';
  }

  Toast.show({
    type: 'error',
    text1: 'Lỗi',
    text2: errorMsg,
  });

  throw {message: errorMsg};
};

/**
 * 🌟 HÀM POST API BẰNG FETCH
 */
export const postApi = async (url: string, data: any) => {
  try {
    const token = await getAccessToken();
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, '$1');
    console.log('fullUrl postApi: ', fullUrl);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (e) {
        errorBody = null;
      }
      const customError = {
        status: response.status,
        message: errorBody?.message || `Lỗi hệ thống (${response.status})`,
        data: errorBody?.data || null,
        error: errorBody?.error || '',
      };
      handleFetchError(customError, `POST ${url}`);
      throw customError;
    }
    return await handleFetchResponse(response);
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    handleFetchError(error, `POST ${url}`);
    throw error;
  }
};

/**
 * 🌟 HÀM POST IMG API
 */
export const postImgApi = async (url: string, formData: FormData) => {
  try {
    const token = await getAccessToken();
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, '$1');
    console.log('🚀 fullUrl postImgApi: ', fullUrl);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, `POST IMG ${url}`);
    throw error;
  }
};

/**
 * 🌟 HÀM GET API BẰNG FETCH
 */
export const getApi = async (url: string, params?: Record<string, any>) => {
  try {
    const token = await getAccessToken();
    let fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, '$1');
    console.log('API gọi hàm getApi: ', fullUrl);

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        params as Record<string, string>,
      ).toString();
      fullUrl += `?${queryString}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: headers,
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, `GET ${url}`);
    throw error; // 🌟 Bổ sung throw error để đồng bộ cấu trúc bẫy lỗi với các hàm khác
  }
};

/**
 * 🌟 HÀM PUT API BẰNG FETCH
 */
export const putApi = async (url: string, data: any) => {
  try {
    const token = await getAccessToken();
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, '$1');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data),
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, `PUT ${url}`);
    throw error;
  }
};

/**
 * 🌟 HÀM DELETE API BẰNG FETCH
 */
export const deleteApi = async (url: string) => {
  try {
    const token = await getAccessToken();
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, '$1');
    console.log('url delete: ', fullUrl);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: headers,
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, `DELETE ${url}`);
    throw error;
  }
};

/**
 * 🌟 HÀM ĐĂNG NHẬP
 */
export const login = async (payload: object) => {
  try {
    const loginUrl = `${api_url}/user/login`.replace(/([^:]\/)\/+/g, '$1');
    console.log('🚀 Gọi API Login:', loginUrl);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, 'LOGIN');
    throw error;
  }
};
