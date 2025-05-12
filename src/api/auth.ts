import axiosInstance from "./axios";

// 登录服务
export const login = async (email: string, password: string) => {
  const response = await axiosInstance.post("/api/auth/login", { email, password });
  return response;
};

// 注册服务
export const register = async (email: string, password: string) => {
  const response = await axiosInstance.post("/api/auth/register", { email, password });
  return response;
};

// 发送重置密码邮件
export const resetPasswordRequest = async (email: string) => {
  const response = await axiosInstance.post("/api/auth/reset-password", { email });
  return response;
};

// 更新密码
export const updatePassword = async (password: string) => {
  const response = await axiosInstance.put("/api/auth/reset-password", { password });
  return response;
};

// 发送OTP登录验证码
export const sendOtpLogin = async (email: string, shouldCreateUser = false) => {
  const response = await axiosInstance.post("/api/auth/otp", { email, shouldCreateUser });
  return response;
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/api/auth/me");
  return response;
};

// 退出登录
export const logout = async () => {
  const response = await axiosInstance.post("/api/auth/logout");
  return response;
}; 