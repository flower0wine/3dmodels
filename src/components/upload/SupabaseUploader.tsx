"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { uploadFile } from "@/lib/supabase/storage";
import { cn, generateUniqueFilePath } from "@/lib/utils";

export interface SupabaseUploaderProps {
  bucket?: string;
  folder?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number; // MB
  multiple?: boolean;
  upsert?: boolean;
  className?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  path: string;
  publicUrl: string;
  uploadedAt: Date;
}

export function SupabaseUploader({
  bucket = "uploads",
  folder = "",
  allowedFileTypes,
  maxFileSize = 50, // 默认50MB
  multiple = true,
  upsert = false,
  className,
  onUploadComplete,
  onUploadError,
}: SupabaseUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当文件选择改变时
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // 检查文件大小
    const invalidSizeFiles = fileArray.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (invalidSizeFiles.length > 0) {
      toast.error(`文件大小超过限制 (${maxFileSize}MB): ${invalidSizeFiles.map(f => f.name).join(", ")}`);
      return;
    }
    
    // 检查文件类型（如果指定了允许的类型）
    if (allowedFileTypes && allowedFileTypes.length > 0) {
      const invalidTypeFiles = fileArray.filter(file => {
        // 检查MIME类型或扩展名
        return !allowedFileTypes.some(type => {
          if (type.startsWith(".")) {
            // 扩展名检查
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          } else {
            // MIME类型检查 (支持通配符，如 image/*)
            if (type.endsWith("/*")) {
              const typePrefix = type.split("/*")[0];
              return file.type.startsWith(typePrefix);
            }
            return file.type === type;
          }
        });
      });
      
      if (invalidTypeFiles.length > 0) {
        toast.error(`不支持的文件类型: ${invalidTypeFiles.map(f => f.name).join(", ")}`);
        return;
      }
    }
    
    // 如果不允许多选，只保留最后选择的文件
    if (!multiple) {
      setSelectedFiles(fileArray.slice(-1));
    } else {
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
  }, [maxFileSize, allowedFileTypes, multiple]);

  // 删除已选文件
  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 开始上传
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.warning("请先选择要上传的文件");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    const uploadedResults: UploadedFile[] = [];
    const totalFiles = selectedFiles.length;
    let completedFiles = 0;

    try {
      // 逐个上传文件
      for (const file of selectedFiles) {
        const uniquePath = generateUniqueFilePath(file.name, folder);
        
        // 使用服务端函数上传
        const result = await uploadFile(bucket, uniquePath, file, {
          upsert
        }) as any;
        
        if (result.error) {
          toast.error(`上传文件 ${file.name} 失败: ${result.error.message}`);
          if (onUploadError) onUploadError(result.error as Error);
        } else if (result.data) {
          // 添加到已上传文件列表
          uploadedResults.push({
            name: file.name,
            size: file.size,
            type: file.type,
            path: uniquePath,
            publicUrl: result.data.publicUrl || "",
            uploadedAt: new Date()
          });
        }
        
        // 更新进度
        completedFiles++;
        const currentProgress = Math.round((completedFiles / totalFiles) * 100);
        setProgress(currentProgress);
      }
      
      // 所有文件上传完成
      setUploadedFiles(uploadedResults);
      if (onUploadComplete) onUploadComplete(uploadedResults);
      
      if (uploadedResults.length > 0) {
        toast.success(`成功上传 ${uploadedResults.length} 个文件`);
      }
      
      // 重置选择的文件
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const error = err instanceof Error ? err : new Error("上传过程中发生未知错误");
      console.error("上传错误:", err);
      toast.error(`上传失败: ${error.message}`);
      if (onUploadError) onUploadError(error);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, bucket, folder, upsert, onUploadComplete, onUploadError]);
  
  // 复制文件URL到剪贴板
  const copyToClipboard = useCallback((url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success("已复制URL到剪贴板"))
      .catch(() => toast.error("复制URL失败"));
  }, []);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>文件上传</CardTitle>
        <CardDescription>
          直接上传文件到 Supabase 存储桶 {bucket}
          {folder && ` (文件夹: ${folder})`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">选择文件</Label>
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
            accept={allowedFileTypes?.join(",")}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            最大文件大小: {maxFileSize}MB
            {allowedFileTypes && allowedFileTypes.length > 0 && 
              ` | 支持的文件类型: ${allowedFileTypes.join(", ")}`}
          </p>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">已选择的文件 ({selectedFiles.length})</h4>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm border rounded-md p-2">
                  <div className="truncate flex-1">
                    <span>{file.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                    disabled={isUploading}
                    className="ml-2"
                  >
                    ✕
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>上传进度</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">上传成功的文件</h4>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between text-sm border rounded-md p-2">
                  <div className="truncate flex-1">
                    <span>{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(file.publicUrl)}
                    className="ml-2"
                  >
                    复制URL
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          disabled={isUploading || selectedFiles.length === 0}
        >
          清除
        </Button>
        <Button 
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? `上传中... ${progress}%` : "开始上传"}
        </Button>
      </CardFooter>
    </Card>
  );
} 