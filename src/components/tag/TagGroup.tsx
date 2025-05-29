"use client";

import React from "react";
import { Tag } from "@/types/tag";
import { cn } from "@/lib/utils";
import { TagBadge } from "@/components/tag/TagBadge";

interface TagGroupProps {
  tags: Tag[];
  onTagClick?: (tagId: string) => void;
  onTagRemove?: (tagId: string) => void;
  className?: string;
  tagClassName?: string;
  removable?: boolean;
  selectable?: boolean;
  selectedTags?: string[];
  emptyText?: string;
}

/**
 * 标签组组件
 */
export function TagGroup({
  tags,
  onTagClick,
  onTagRemove,
  className,
  tagClassName,
  removable = false,
  selectable = false,
  selectedTags = [],
  emptyText = "暂无标签"
}: TagGroupProps) {
  if (!tags || tags.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyText}</div>;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          onClick={onTagClick}
          onRemove={onTagRemove}
          className={tagClassName}
          removable={removable}
          selectable={selectable}
          selected={selectedTags.includes(tag.id)}
        />
      ))}
    </div>
  );
} 