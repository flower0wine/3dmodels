import { useInfiniteQuery } from "@tanstack/react-query";
import { ModelsResponse } from "@/types/model";
import { getUserModels } from "@/lib/supabase/models";

// 获取用户模型列表的Hooks
export function useUserModelsInfinite(initialLimit = 20, searchQuery = '') {
  return useInfiniteQuery<ModelsResponse>({
    queryKey: ["userModels", searchQuery],
    queryFn: ({ pageParam }) =>
      getUserModels(pageParam as string | undefined, initialLimit, searchQuery),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5分钟
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    refetchOnMount: true, // 组件挂载时重新获取
  });
} 