import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ModelsResponse } from "@/types/model";
import {
  getModels,
  getModelById,
  getModelFileUrl,
} from "@/lib/supabase/models";

// 获取模型列表的Hooks
export function useModelsInfinite(initialLimit = 20, searchQuery = '') {
  return useInfiniteQuery<ModelsResponse>({
    queryKey: ["models", searchQuery],
    queryFn: ({ pageParam }) =>
      getModels(pageParam as string | undefined, initialLimit, searchQuery),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5分钟
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });
}

// 获取单个模型的Hooks
export function useModel(id: string) {
  return useQuery({
    queryKey: ["model", id],
    queryFn: () => getModelById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10分钟
  });
}

// 获取模型文件URL的Hooks
export function useModelFileUrl(key: string | null) {
  return useQuery({
    queryKey: ["modelFileUrl", key],
    queryFn: () => getModelFileUrl(key!),
    enabled: !!key,
    staleTime: 1000 * 60 * 60, // 1小时
  });
} 