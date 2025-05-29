"use client";

import { useCallback, useState } from "react";
import { Tag, TagInput } from "@/types/tag";
import { getTags, createTag, updateTag, deleteTag, getUserTags } from "@/lib/supabase/tags";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * 标签管理Hook
 * @param userOnly 是否只获取当前用户创建的标签
 * @param searchQuery 搜索关键词
 * @returns 标签相关的状态和方法
 */
export function useTags(userOnly: boolean = false, searchQuery: string = "") {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | null>(null);
  
  // 获取标签列表
  const { 
    data: tagsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tags", userOnly, searchQuery, cursor],
    queryFn: async () => {
      try {
        if (userOnly) {
          return await getUserTags(cursor || undefined, 50, searchQuery);
        } else {
          return await getTags(cursor || undefined, 50, searchQuery);
        }
      } catch (err) {
        console.error("获取标签失败:", err);
        throw err;
      }
    }
  });
  
  // 加载更多标签
  const loadMore = useCallback(() => {
    if (tagsData?.nextCursor) {
      setCursor(tagsData.nextCursor);
    }
  }, [tagsData]);
  
  // 创建标签
  const createTagMutation = useMutation({
    mutationFn: async (newTag: TagInput) => {
      return await createTag(newTag);
    },
    onSuccess: () => {
      toast.success("标签创建成功");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error: Error) => {
      toast.error(`创建标签失败: ${error.message}`);
    }
  });
  
  // 更新标签
  const updateTagMutation = useMutation({
    mutationFn: async ({ id, tag }: { id: string, tag: TagInput }) => {
      return await updateTag(id, tag);
    },
    onSuccess: () => {
      toast.success("标签更新成功");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error: Error) => {
      toast.error(`更新标签失败: ${error.message}`);
    }
  });
  
  // 删除标签
  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteTag(id);
    },
    onSuccess: () => {
      toast.success("标签删除成功");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // 同时清除和标签相关的模型缓存
      queryClient.invalidateQueries({ queryKey: ["model-tags"] });
    },
    onError: (error: Error) => {
      toast.error(`删除标签失败: ${error.message}`);
    }
  });
  
  // 处理标签创建
  const handleCreateTag = useCallback(async (tagData: TagInput) => {
    createTagMutation.mutate(tagData);
  }, [createTagMutation]);
  
  // 处理标签更新
  const handleUpdateTag = useCallback(async (id: string, tagData: TagInput) => {
    updateTagMutation.mutate({ id, tag: tagData });
  }, [updateTagMutation]);
  
  // 处理标签删除
  const handleDeleteTag = useCallback(async (id: string) => {
    deleteTagMutation.mutate(id);
  }, [deleteTagMutation]);
  
  return {
    tags: tagsData?.tags || [],
    nextCursor: tagsData?.nextCursor,
    isLoading,
    isError,
    error,
    refetch,
    loadMore,
    createTag: handleCreateTag,
    updateTag: handleUpdateTag,
    deleteTag: handleDeleteTag,
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending
  };
} 