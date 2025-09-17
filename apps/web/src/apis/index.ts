// axios
import axios from "axios";
import { type Paging } from "@workspace/types/api";

export type CommonResType<T = unknown> = {
  success: boolean;
  data?: T;
  paging?: Paging;
  message?: string;
  errorCode?: string;
};

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_SERVER,
  withCredentials: true,
});

export const api = {
  get: <T>(url: string, params?: any, config?: any) =>
    instance.get<T>(url, { params, ...config }),
  post: <T>(url: string, data?: any, config?: any) =>
    instance.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: any) =>
    instance.put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: any) =>
    instance.patch<T>(url, data, config),
  delete: <T>(url: string, params?: any, config?: any) =>
    instance.delete<T>(url, { params, ...config }),
};
