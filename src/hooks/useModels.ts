import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ModelsResponse } from "@/types/model";
import {
  getModels,
  getModelById,
  getModelFileUrl,
} from "@/lib/supabase/models";

// 获取模型列表的Hooks
export function useModelsInfinite(initialLimit = 20) {
  return useInfiniteQuery<ModelsResponse>({
    queryKey: ["models"],
    queryFn: ({ pageParam }) =>
      getModels(pageParam as string | undefined, initialLimit),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5分钟
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