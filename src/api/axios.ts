import axios from "axios";

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API请求错误:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance; 