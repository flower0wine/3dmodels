"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

// 动态导入文件上传组件
const FileUploader = dynamic(() => import("@/components/upload/FileUploader").then(mod => mod.FileUploader), {
  loading: () => <div className="p-8 text-center">加载上传组件...</div>,
  ssr: false,
});

interface NavbarUploadButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const NavbarUploadButton: React.FC<NavbarUploadButtonProps> = ({
  className = "",
  variant = "default",
  size = "sm",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUploadComplete = (files: any[]) => {
    setUploadedFiles([...uploadedFiles, ...files]);
    console.log("上传完成:", files);
    // 上传完成后可以关闭对话框或者执行其他操作
    // setIsOpen(false);
  };

  const handleUploadError = (error: Error) => {
    console.error("上传错误:", error);
    // 这里可以处理错误，例如显示错误消息
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <PlusIcon className="mr-1 h-4 w-4" /> 上传
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>上传文件</DialogTitle>
            <DialogDescription>
              上传您的3D模型、图片、视频或其他文件。
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <Cross2Icon className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="mt-4">
          <FileUploader
            bucket="models"
            folder="uploads"
            multiple={true}
            maxFileSize={100}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            height="420px"
            note="支持拖拽上传，最大文件大小：100MB"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}; 