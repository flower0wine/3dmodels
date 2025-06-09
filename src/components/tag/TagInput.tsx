"use client";

import React, { useState, useRef, KeyboardEvent, useEffect, useTransition, useCallback } from "react";
import { X, Edit, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/useTags";
import { Tag, tagInputSchema, TagInput as TagInputType } from "@/types/tag";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InlineTagInputProps {
  modelTags: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

// 单独的标签组件，提高可读性
function TagBadge({ 
  tag, 
  readOnly, 
  onRemove, 
  onEdit 
}: { 
  tag: Tag; 
  readOnly: boolean; 
  onRemove: (tag: Tag) => void;
  onEdit: (tag: Tag) => void;
}) {
  return (
    <Badge
      key={tag.id}
      variant="secondary"
      className="flex items-center gap-1 px-2 py-1"
    >
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={() => onEdit(tag)}
          title={tag.description || "点击编辑标签描述"}
        >
          <Edit className="h-3 w-3" />
        </Button>
      )}
      <span>{tag.name}</span>
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
          onClick={() => onRemove(tag)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}

export function InlineTagInput({
  modelTags = [],
  onTagsChange,
  readOnly = false,
  placeholder = "添加标签...",
  className = "",
}: InlineTagInputProps) {
  const [inputTagName, setInputTagName] = useState("");
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [tags, setTags] = useState<Tag[]>(modelTags);
  const [creatingTagName, setCreatingTagName] = useState<string | null>(null);
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    selectedTag: Tag | null;
    description: string;
  }>({
    isOpen: false,
    selectedTag: null,
    description: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // refs
  const inputRef = useRef<HTMLInputElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  
  // 使用useTransition标记低优先级更新
  const [isPending, startTransition] = useTransition();
  
  // 数据获取 - 标签相关操作
  const { 
    tags: allTags, 
    createTag,
    updateTag,
    isCreating,
    isUpdating,
    isLoading: isTagsLoading
  } = useTags(false, searchQuery);
  
  // 同步外部传入的标签
  useEffect(() => {
    setTags(modelTags);
  }, [modelTags]);

  // 当标签变化时通知父组件
  useEffect(() => {
    onTagsChange?.(tags);
  }, [tags]);
  
  // 点击外部关闭搜索面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchPanelRef.current && 
        !searchPanelRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResultPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 如果正在创建标签，则不处理输入
    if (creatingTagName !== null) return;
    
    const value = e.target.value;
    
    setInputTagName(value);
    setShowResultPanel(Boolean(value.trim()))
    
    startTransition(() => {
      setSearchQuery(value.trim());
    });
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!inputTagName.trim()) return;
    
    // 如果已经有标签在创建中，则不执行添加操作
    if (creatingTagName !== null) return;

    // 按下Enter添加标签
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputTagName);
    } else if (e.key === 'Escape') {
      setShowResultPanel(false);
    }
  };

  const addTag = async (tagName: string) => {
    const trimmedName = tagName.trim();
    if (!trimmedName) return;

    // 检查是否已存在同名标签
    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTag) {
      toast.error(`标签 "${trimmedName}" 已添加`);
      return;
    }

    // 查找现有标签
    const existingGlobalTag = allTags.find(
      (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingGlobalTag) {
      setTags(prevTags => [...prevTags, existingGlobalTag]);
    } else {
      // 创建新标签
      const tagData: TagInputType = {
        name: trimmedName
      };
      
      try {
        // 设置创建中状态
        setCreatingTagName(trimmedName);
        // 异步创建标签
        const newTag = await createTag(tagData);
        setTags(prevTags => [...prevTags, newTag]);

        setInputTagName("");
        setShowResultPanel(false);
      } catch (error) {
        console.error("创建标签失败:", error);
        toast.error("创建标签失败");
      } finally {
        setCreatingTagName(null);
      }
    }
  };

  // 移除标签
  const removeTag = useCallback((tagToRemove: Tag) => {
    setTags(prevTags => prevTags.filter((tag) => tag.id !== tagToRemove.id));
  }, []);

  // 打开编辑对话框
  const openEditDialog = useCallback((tag: Tag) => {
    setEditState({
      isOpen: true,
      selectedTag: tag,
      description: tag.description || ""
    });
  }, []);

  // 保存标签描述
  const saveTagDescription = useCallback(async () => {
    const { selectedTag, description } = editState;
    if (!selectedTag) return;

    try {
      await updateTag(selectedTag.id, {
        name: selectedTag.name,
        description
      });

      setTags(prevTags => prevTags.map(tag => 
        tag.id === selectedTag.id 
          ? {...tag, description} 
          : tag
      ));

      setEditState(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error("更新标签失败:", error);
      toast.error("更新标签描述失败");
    }
  }, [editState]);
  
  // 从搜索结果中选择标签
  const selectTagFromSearch = useCallback((tag: Tag) => {
    // 检查是否已添加
    if (tags.some(t => t.id === tag.id)) {
      toast.error(`标签 "${tag.name}" 已添加`);
      return;
    }
    
    setTags(prevTags => [...prevTags, tag]);
  }, [tags]);
  
  // 过滤标签，排除已添加的
  const filteredTags = allTags.filter(tag => 
    !tags.some(t => t.id === tag.id) && 
    (searchQuery ? tag.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
  );
  
  // 检查是否没有匹配结果但有输入内容
  const noMatchButHasInput = inputTagName.trim() && filteredTags.length === 0;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 已添加的标签 */}
      {tags.map((tag) => (
        <TagBadge 
          key={tag.id}
          tag={tag}
          readOnly={readOnly}
          onRemove={removeTag}
          onEdit={openEditDialog}
        />
      ))}

      {/* 标签输入框 */}
      {!readOnly && (
        <div className="relative">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={isPending ? "处理中..." : creatingTagName ? "创建标签中..." : placeholder}
              value={creatingTagName ? `创建 "${creatingTagName}" 中...` : inputTagName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => inputTagName.trim() && setShowResultPanel(true)}
              className={`h-8 w-auto min-w-[150px] pr-8 ${creatingTagName ? "opacity-70" : ""}`}
              disabled={creatingTagName !== null}
            />
            {isPending ? (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4">
                <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          {/* 搜索结果面板 */}
          {showResultPanel && (
            <div 
              ref={searchPanelRef}
              className="absolute z-50 top-full mt-1 w-64 bg-background border rounded-md shadow-md"
            >
              <div className="p-2">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">搜索结果</h3>
                
                {isTagsLoading || isPending ? (
                  <div className="py-2 text-center text-sm text-muted-foreground flex items-center justify-center">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>加载中...</span>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[200px]">
                    {filteredTags.length > 0 ? (
                      <div className="space-y-1">
                        {filteredTags.map(tag => (
                          <Button
                            key={tag.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => selectTagFromSearch(tag)}
                          >
                            <span className="truncate">{tag.name}</span>
                            {tag.description && (
                              <span className="ml-1 text-xs text-muted-foreground truncate">
                                - {tag.description}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        {inputTagName.trim() ? "未找到匹配标签" : "输入以搜索标签"}
                      </div>
                    )}
                    
                    {/* 创建新标签选项 */}
                    {noMatchButHasInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left font-normal mt-2 border-t pt-2"
                        onClick={() => addTag(inputTagName)}
                        disabled={isPending || isCreating || creatingTagName !== null}
                      >
                        {creatingTagName === inputTagName.trim() ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span>创建中...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            <span>创建标签 "{inputTagName.trim()}"</span>
                          </>
                        )}
                      </Button>
                    )}
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 标签编辑对话框 */}
      <Dialog 
        open={editState.isOpen} 
        onOpenChange={(open) => setEditState(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑标签描述</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">标签名称</h4>
              <p className="text-sm">{editState.selectedTag?.name}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">描述</h4>
              <Textarea
                placeholder="输入标签描述（可选）"
                value={editState.description}
                onChange={(e) => setEditState(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditState(prev => ({ ...prev, isOpen: false }))}
            >
              取消
            </Button>
            <Button 
              onClick={saveTagDescription}
              disabled={isUpdating || isPending}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}