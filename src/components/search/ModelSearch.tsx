"use client";

import { useState, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";

interface ModelSearchProps {
  className?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export default function ModelSearch({ 
  className = "", 
  placeholder = "搜索模型...",
  onSearch
}: ModelSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 防抖处理搜索
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      // 过滤或处理可能导致问题的特殊字符
      const sanitizedTerm = searchTerm.replace(/[\%_]/g, '');
      onSearch(sanitizedTerm);
    }, 300),
    [onSearch]
  );
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // 如果搜索词为空或只有空格，立即清除搜索
    if (!value.trim()) {
      onSearch('');
      return;
    }
    
    // 否则使用防抖处理
    debouncedSearch(value);
  };
  
  // 清除搜索
  const handleClear = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={`relative w-full max-w-[100%] sm:max-w-md ${className}`}
    >
      <div 
        className={`
          flex items-center h-10 sm:h-11 rounded-full border px-4 py-2
          transition-all duration-200 ease-in-out
          bg-white dark:bg-zinc-800 shadow-sm
          ${isFocused ? 
            'ring-2 ring-blue-400 dark:ring-blue-500 border-transparent shadow-md' : 
            'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}
        `}
      >
        <Search 
          className={`
            h-4 w-4 mr-2 shrink-0 transition-colors
            ${isFocused ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}
          `}
          strokeWidth={2}
          aria-hidden="true" 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="
            flex-1 bg-transparent outline-none w-full
            text-sm sm:text-base text-gray-800 dark:text-gray-200
            placeholder:text-gray-400 dark:placeholder:text-gray-500
          "
        />
        {query && (
          <button
            onClick={handleClear}
            className="
              h-5 w-5 rounded-full flex items-center justify-center shrink-0 
              ml-1 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600
              transition-colors duration-150
            "
            type="button"
            aria-label="清除搜索"
          >
            <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// 防抖函数
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
) {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
} 