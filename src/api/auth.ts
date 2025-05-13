import axiosInstance from "@/api/axios";
import { User, Session } from "@supabase/supabase-js";

// 定义响应类型
interface AuthResponse {
  user?: User;
  session?: Session;
  message?: string;
  error?: string;
}

// 登录服务
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return axiosInstance.post("/auth/login", { email, password });
};

// 注册服务
export const register = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return axiosInstance.post("/auth/register", { email, password });
};

// 发送重置密码邮件
export const resetPasswordRequest = async (
  email: string
): Promise<AuthResponse> => {
  return axiosInstance.post("/auth/reset-password", { email });
};

// 更新密码
export const updatePassword = async (
  password: string
): Promise<AuthResponse> => {
  return axiosInstance.put("/auth/reset-password", { password });
};

// 发送OTP登录验证码
export const sendOtpLogin = async (
  email: string,
  shouldCreateUser = false
): Promise<AuthResponse> => {
  return axiosInstance.post("/auth/otp", { email, shouldCreateUser });
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<AuthResponse> => {
  return axiosInstance.get("/auth/me");
};

// 退出登录
export const logout = async (): Promise<AuthResponse> => {
  return axiosInstance.post("/auth/logout");
};
