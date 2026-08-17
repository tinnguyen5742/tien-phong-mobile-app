export const api_url = "http://125.212.210.184:8060/api/v1";

import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Hàm Helper nội bộ để lấy Token của user từ bộ nhớ thiết bị
 */
const getAccessToken = async (): Promise<string | null> => {
  try {
    const userRaw = await AsyncStorage.getItem("storeUSerData");
    if (!userRaw) return null;
    const userData = JSON.parse(userRaw);
    return userData?.tokenID || null;
  } catch (error) {
    console.error("Lỗi truy cập AsyncStorage:", error);
    return null;
  }
};

/**
 * Hàm Helper tạo Header mặc định an toàn cho cả iOS và Android
 */
const getHeaders = async (isJson = true) => {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Hàm Helper nội bộ để xử lý Phản hồi (Response) và Bẫy lỗi từ Fetch
 */
const handleFetchResponse = async (response: Response) => {
  if (response.status === 401) {
    const errorMsg = "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.";
    Toast.show({
      type: "error",
      text1: "Hết hạn phiên",
      text2: errorMsg,
    });
    throw { message: errorMsg, status: 401 };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (errorData?.Message === "Unauthorized.") {
      const errorMsg = "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.";
      Toast.show({
        type: "error",
        text1: "Hết hạn phiên",
        text2: errorMsg,
      });
      throw { message: errorMsg, status: 401 };
    }

    throw {
      message:
        errorData?.Message ||
        errorData?.message ||
        `Lỗi hệ thống (${response.status})`,
      status: response.status,
      data: errorData?.data || null,
    };
  }
  return await response.json();
};

/**
 * Hàm Helper nội bộ để xử lý lỗi mạng vật lý (Catch Block)
 */
const handleFetchError = (error: any, apiName: string) => {
  if (error.status) throw error; // Lỗi HTTP status đã bẫy thì đẩy ra ngoài, không Toast trùng

  console.error(`❌ Lỗi kết nối mạng tại ${apiName}:`, error.message);
  let errorMsg = "Không thể kết nối đến máy chủ";
  if (error.message === "Failed to fetch") {
    errorMsg = "Lỗi kết nối mạng hoặc sai địa chỉ IP máy chủ";
  }

  Toast.show({
    type: "error",
    text1: "Lỗi",
    text2: errorMsg,
  });

  throw { message: errorMsg };
};

/**
 * 🌟 HÀM POST API BẰNG FETCH
 */
export const postApi = async (url: string, data: any) => {
  try {
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, "$1");
    console.log("fullUrl postApi: ", fullUrl);

    const headers = await getHeaders(true);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, `POST ${url}`);
    throw error;
  }
};

/**
 * 🌟 HÀM POST IMG API
 */
export const postImgApi = async (url: string, formData: FormData) => {
  try {
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, "$1");
    console.log("🚀 fullUrl postImgApi: ", fullUrl);

    const headers = await getHeaders(false);

    const response = await fetch(fullUrl, {
      method: "POST",
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
    let fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, "$1");
    console.log("API gọi hàm getApi: ", fullUrl);

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        params as Record<string, string>,
      ).toString();
      fullUrl += `?${queryString}`;
    }

    const headers = await getHeaders(true);

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers,
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, `GET ${url}`);
    throw error;
  }
};

/**
 * 🌟 HÀM PUT API BẰNG FETCH
 */
export const putApi = async (url: string, data: any) => {
  try {
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, "$1");
    const headers = await getHeaders(true);

    const response = await fetch(fullUrl, {
      method: "PUT",
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
    const fullUrl = `${api_url}${url}`.replace(/([^:]\/)\/+/g, "$1");
    console.log("url delete: ", fullUrl);

    const headers = await getHeaders(true);

    const response = await fetch(fullUrl, {
      method: "DELETE",
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
    const loginUrl = `${api_url}/auth/login2`.replace(/([^:]\/)\/+/g, "$1");
    console.log("🚀 Gọi API Login:", loginUrl);

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Host: "125.212.210.184:8060",
      },
      body: JSON.stringify(payload),
    });

    return await handleFetchResponse(response);
  } catch (error: any) {
    handleFetchError(error, "LOGIN");
    throw error;
  }
};
