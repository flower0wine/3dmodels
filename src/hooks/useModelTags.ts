"use client";

import { useCallback } from "react";
import { Tag } from "@/types/tag";
import { 
  getModelTags, 
  addTagToModel, 
  removeTagFromModel, 
  updateModelTags 
} from "@/lib/supabase/model-tags";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * 模型标签关联Hook
 * @param modelId 模型ID
 * @returns 模型标签相关的状态和方法
 */
export function useModelTags(modelId: string) {
  const queryClient = useQueryClient();
  
  // 获取模型的标签列表
  const { 
    data: tags,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["model-tags", modelId],
    queryFn: async () => {
      if (!modelId) return [];
      try {
        return await getModelTags(modelId);
      } catch (err) {
        console.error("获取模型标签失败:", err);
        throw err;
      }
    },
    enabled: !!modelId
  });
  
  // 添加标签
  const addTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return await addTagToModel(modelId, tagId);
    },
    onSuccess: () => {
      toast.success("标签添加成功");
      queryClient.invalidateQueries({ queryKey: ["model-tags", modelId] });
    },
    onError: (error: Error) => {
      toast.error(`添加标签失败: ${error.message}`);
    }
  });
  
  // 移除标签
  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return await removeTagFromModel(modelId, tagId);
    },
    onSuccess: () => {
      toast.success("标签移除成功");
      queryClient.invalidateQueries({ queryKey: ["model-tags", modelId] });
    },
    onError: (error: Error) => {
      toast.error(`移除标签失败: ${error.message}`);
    }
  });
  
  // 更新标签集合
  const updateTagsMutation = useMutation({
    mutationFn: async (tagIds: string[]) => {
      return await updateModelTags(modelId, tagIds);
    },
    onSuccess: () => {
      toast.success("标签更新成功");
      queryClient.invalidateQueries({ queryKey: ["model-tags", modelId] });
    },
    onError: (error: Error) => {
      toast.error(`更新标签失败: ${error.message}`);
    }
  });
  
  // 处理添加标签
  const handleAddTag = useCallback((tagId: string) => {
    addTagMutation.mutate(tagId);
  }, [addTagMutation]);
  
  // 处理移除标签
  const handleRemoveTag = useCallback((tagId: string) => {
    removeTagMutation.mutate(tagId);
  }, [removeTagMutation]);
  
  // 处理更新标签集合
  const handleUpdateTags = useCallback((tagIds: string[]) => {
    updateTagsMutation.mutate(tagIds);
  }, [updateTagsMutation]);
  
  // 检查标签是否已添加到模型
  const hasTag = useCallback((tagId: string) => {
    return tags?.some(tag => tag.id === tagId) || false;
  }, [tags]);
  
  return {
    tags: tags || [],
    isLoading,
    isError,
    error,
    refetch,
    addTag: handleAddTag,
    removeTag: handleRemoveTag,
    updateTags: handleUpdateTags,
    hasTag,
    isAdding: addTagMutation.isPending,
    isRemoving: removeTagMutation.isPending,
    isUpdating: updateTagsMutation.isPending
  };
} 