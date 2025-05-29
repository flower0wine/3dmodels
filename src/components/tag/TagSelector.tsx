"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import { TagGroup } from "@/components/tag/TagGroup";
import { useTags } from "@/hooks/useTags";
import { useModelTags } from "@/hooks/useModelTags";
import { TagInput, Tag } from "@/types/tag";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TagSelectorProps {
  modelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 仅用于创建模式
  onTagsSelected?: (tagIds: string[]) => void;
  initialSelectedTags?: string[];
}

/**
 * 标签选择器组件
 */
export function TagSelector({ 
  modelId, 
  open, 
  onOpenChange,
  onTagsSelected,
  initialSelectedTags = []
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDesc, setNewTagDesc] = useState("");
  
  // 创建模式下的临时选中标签列表
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialSelectedTags);
  
  // 是否为创建模式
  const isCreateMode = !modelId && !!onTagsSelected;
  
  // 记录上一次的标签列表，用于检测新创建的标签
  const [previousTagsLength, setPreviousTagsLength] = useState(0);
  
  // 加载所有标签
  const { 
    tags: allTags, 
    isLoading: isLoadingTags,
    createTag,
    isCreating,
    refetch: refetchTags
  } = useTags(false, searchQuery);
  
  // 当标签列表长度变化时，查找新创建的标签并自动选中
  useEffect(() => {
    if (allTags.length > previousTagsLength && isCreateMode && showCreateForm) {
      // 找到新创建的标签（简单假设最后一个是新创建的）
      const newTag = allTags[allTags.length - 1];
      if (newTag && !selectedTagIds.includes(newTag.id)) {
        const newSelectedTags = [...selectedTagIds, newTag.id];
        setSelectedTagIds(newSelectedTags);
        if (onTagsSelected) {
          onTagsSelected(newSelectedTags);
        }
      }
      setShowCreateForm(false);
    }
    setPreviousTagsLength(allTags.length);
  }, [allTags.length, isCreateMode, onTagsSelected, selectedTagIds, showCreateForm]);
  
  // 加载模型的标签(仅在编辑模式下)
  const {
    tags: modelTags,
    addTag,
    removeTag,
    hasTag,
    isAdding,
    isRemoving
  } = useModelTags(modelId);
  
  // 当搜索查询变化时，重置创建表单
  useEffect(() => {
    setShowCreateForm(false);
    setNewTagName("");
    setNewTagDesc("");
  }, [searchQuery]);
  
  // 当initialSelectedTags变化时，更新selectedTagIds
  useEffect(() => {
    if (isCreateMode) {
      setSelectedTagIds(initialSelectedTags);
    }
  }, [initialSelectedTags, isCreateMode]);
  
  // 处理创建新标签
  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim()) return;
    
    const tagData: TagInput = {
      name: newTagName.trim(),
      description: newTagDesc.trim() || undefined
    };
    
    try {
      // 创建标签
      await createTag(tagData);
      // 清空表单字段
      setNewTagName("");
      setNewTagDesc("");
      // 刷新标签列表，useEffect会处理自动选中新标签
      await refetchTags();
    } catch (error) {
      console.error("创建标签失败:", error);
    }
  }, [newTagName, newTagDesc, createTag, refetchTags]);
  
  // 过滤掉已选择的标签，仅在搜索时显示匹配的标签
  const filteredTags = allTags.filter(tag => {
    // 如果有搜索词，仅显示匹配的标签
    if (searchQuery) {
      return tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // 否则显示所有标签
    return true;
  });
  
  // 检查是否找不到匹配的标签，且有搜索词
  const showCreateTagOption = searchQuery.trim() && 
    !filteredTags.some(tag => 
      tag.name.toLowerCase() === searchQuery.toLowerCase()
    );
  
  // 创建模式下的标签处理
  const handleCreateModeTagToggle = (tagId: string) => {
    let newSelectedTags: string[];
    
    if (selectedTagIds.includes(tagId)) {
      // 移除标签
      newSelectedTags = selectedTagIds.filter(id => id !== tagId);
    } else {
      // 添加标签
      newSelectedTags = [...selectedTagIds, tagId];
    }
    
    setSelectedTagIds(newSelectedTags);
    
    // 通知父组件
    if (onTagsSelected) {
      onTagsSelected(newSelectedTags);
    }
  };
  
  // 创建模式下获取已选标签对象
  const getSelectedTags = (): Tag[] => {
    if (!isCreateMode) return modelTags;
    
    return selectedTagIds
      .map(id => allTags.find(tag => tag.id === id))
      .filter((tag): tag is Tag => !!tag);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>管理标签</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索标签..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          {/* 已选标签 */}
          <div>
            <h4 className="mb-2 text-sm font-medium">已选标签</h4>
            <TagGroup 
              tags={isCreateMode ? getSelectedTags() : modelTags} 
              removable={true}
              onTagRemove={isCreateMode 
                ? handleCreateModeTagToggle 
                : removeTag
              }
              emptyText="暂未选择标签"
            />
          </div>
          
          {/* 可选标签 */}
          <div>
            <h4 className="mb-2 text-sm font-medium">可用标签</h4>
            {isLoadingTags ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="max-h-[200px]">
                <TagGroup 
                  tags={filteredTags} 
                  selectable={true}
                  selectedTags={isCreateMode 
                    ? selectedTagIds 
                    : modelTags.map(tag => tag.id)
                  }
                  onTagClick={isCreateMode 
                    ? handleCreateModeTagToggle 
                    : (tagId) => {
                        if (hasTag(tagId)) {
                          removeTag(tagId);
                        } else {
                          addTag(tagId);
                        }
                      }
                  }
                  emptyText="未找到匹配的标签"
                />
                
                {/* 创建新标签选项 */}
                {showCreateTagOption && !showCreateForm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 flex items-center gap-1"
                    onClick={() => {
                      setShowCreateForm(true);
                      setNewTagName(searchQuery);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    创建标签 "{searchQuery}"
                  </Button>
                )}
              </ScrollArea>
            )}
          </div>
          
          {/* 创建标签表单 */}
          {showCreateForm && (
            <div className="space-y-2 rounded-md border p-3">
              <h4 className="text-sm font-medium">创建新标签</h4>
              <Input
                placeholder="标签名称"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="标签描述（可选）"
                value={newTagDesc}
                onChange={(e) => setNewTagDesc(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  取消
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      创建中
                    </>
                  ) : "创建"}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>完成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 