"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/types/tag";

interface TagBadgeProps {
  tag: Tag | { id: string; name: string };
  onClick?: (tagId: string) => void;
  onRemove?: (tagId: string) => void;
  className?: string;
  removable?: boolean;
  selectable?: boolean;
  selected?: boolean;
}

/**
 * 标签徽章组件
 */
export function TagBadge({
  tag,
  onClick,
  onRemove,
  className,
  removable = false,
  selectable = false,
  selected = false,
}: TagBadgeProps) {
  const handleClick = () => {
    if (selectable && onClick) {
      onClick(tag.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag.id);
    }
  };

  return (
    <Badge
      variant={selected ? "default" : "secondary"}
      className={cn(
        "gap-1 px-2 py-1 text-xs font-medium",
        selectable && "cursor-pointer hover:bg-primary/90 hover:text-primary-foreground",
        className
      )}
      onClick={handleClick}
    >
      {tag.name}
      {removable && (
        <X
          size={12}
          className="ml-1 cursor-pointer hover:text-destructive"
          onClick={handleRemove}
        />
      )}
    </Badge>
  );
} 