import axiosInstance from "./axios";
import { Model, ModelsResponse } from "@/types/model";

// 获取模型列表
export const fetchModels = async (
  cursor?: string,
  limit = 10
): Promise<ModelsResponse> => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());

  return axiosInstance.get(`/models?${params.toString()}`);
};

// 获取单个模型
export const fetchModelById = async (id: string): Promise<Model> => {
  return axiosInstance.get(`/models/${id}`);
};

// 获取模型文件URL
export const getModelFileUrl = async (key: string): Promise<{ url: string }> => {
  return await axiosInstance.get(`/models/file-url?key=${key}`);
}; 