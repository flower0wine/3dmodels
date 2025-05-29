import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ModelsResponse } from "@/types/model";
import {
  getModels,
  getModelById,
} from "@/lib/supabase/models";

// 获取模型列表的Hooks
export function useModelsInfinite(initialLimit = 20, searchQuery = '', fetchUserModels = false) {
  return useInfiniteQuery<ModelsResponse>({
    queryKey: ["models", searchQuery, fetchUserModels],
    queryFn: ({ pageParam }) =>
      getModels(pageParam as string | undefined, initialLimit, searchQuery, fetchUserModels),
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
