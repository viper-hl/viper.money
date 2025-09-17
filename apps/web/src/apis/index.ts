import axios from "axios";

// API Base URL 설정
const API_BASE_URL = import.meta.env.VITE_API_SERVER_URL;

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 인증 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 시 로그아웃 처리
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-token");
      // 필요시 라우터 리다이렉트 추가
    }
    return Promise.reject(error);
  }
);

// 기본 API 함수들
export const api = {
  // GET 요청
  get: <T>(url: string, params?: any) =>
    apiClient.get<T>(url, { params }).then((res) => res.data),

  // POST 요청
  post: <T>(url: string, data?: any) =>
    apiClient.post<T>(url, data).then((res) => res.data),

  // PUT 요청
  put: <T>(url: string, data?: any) =>
    apiClient.put<T>(url, data).then((res) => res.data),

  // DELETE 요청
  delete: <T>(url: string) => apiClient.delete<T>(url).then((res) => res.data),
};
