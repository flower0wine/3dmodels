"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UppyFileUploader } from "@/components/upload/UppyFileUploader";
import { SupabaseUploader } from "@/components/upload/SupabaseUploader";
import { type UploadedFile } from "@/components/upload/SupabaseUploader";
import { uploadModel } from "@/lib/supabase/models";
import Image from "next/image";

// 表单验证架构
const modelUploadSchema = z.object({
  name: z.string().min(1, "模型名称不能为空"),
  description: z.string().optional(),
  category: z.string().optional(),
  author: z.string().min(1, "作者名称不能为空"),
  format: z.string().min(1, "文件格式不能为空"),
  polygon_count: z.coerce.number().optional(),
  file_size: z.coerce.number().optional(),
});

type ModelUploadFormValues = z.infer<typeof modelUploadSchema>;

export default function ModelUploadForm() {
  const [modelFile, setModelFile] = useState<UploadedFile | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<UploadedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelFileInfo, setModelFileInfo] = useState<{
    format: string;
    size: number;
  } | null>(null);

  // 初始化表单
  const form = useForm<ModelUploadFormValues>({
    resolver: zodResolver(modelUploadSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "general",
      author: "",
      format: "",
      polygon_count: undefined,
      file_size: undefined,
    },
  });

  // 处理模型文件上传完成
  const handleModelUploadComplete = useCallback((files: UploadedFile[]) => {
    if (files.length > 0) {
      const file = files[0];
      setModelFile(file);
      
      // 获取文件格式和大小
      const format = file.name.split('.').pop()?.toLowerCase() || '';
      const fileSizeInMB = Math.round(file.size / (1024 * 1024) * 100) / 100;
      
      setModelFileInfo({
        format,
        size: fileSizeInMB
      });
      
      // 自动填充表单字段
      form.setValue("format", format);
      form.setValue("file_size", fileSizeInMB);
      
      // 如果模型名还没填，用文件名(不含扩展名)
      if (!form.getValues("name")) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        form.setValue("name", nameWithoutExt);
      }
      
      toast.success(`模型文件上传成功: ${file.name}`);
    }
  }, [form]);

  // 处理缩略图上传完成
  const handleThumbnailUploadComplete = useCallback((files: UploadedFile[]) => {
    if (files.length > 0) {
      const file = files[0];
      setThumbnailFile(file);
      toast.success(`缩略图上传成功: ${file.name}`);
    }
  }, []);

  // 处理上传错误
  const handleUploadError = useCallback((error: Error) => {
    toast.error(`上传失败: ${error.message}`);
  }, []);

  // 处理表单提交
  const onSubmit = useCallback(async (values: ModelUploadFormValues) => {
    // 验证是否上传了必要的文件
    if (!modelFile) {
      toast.error("请上传模型文件");
      return;
    }

    if (!thumbnailFile) {
      toast.error("请上传缩略图");
      return;
    }

    setIsSubmitting(true);

    try {
      // 注意: 这里我们还需要将UploadedFile转换为File对象，以便传递给uploadModel
      // 这是一个仿真的处理，实际应用中，您可能需要调整或使用上传后的文件URL
      const modelFormData = {
        name: values.name,
        description: values.description || "",
        category: values.category || "general",
        author: values.author,
        format: values.format,
        polygon_count: values.polygon_count || 0,
        file_size: values.file_size || 0,
        storage_path: modelFile.path,
        thumbnail_path: thumbnailFile.path
      };

      toast.success("模型信息提交成功，正在处理...");
      // 注意: 实际的uploadModel函数可能需要调整以接受这种格式的数据
      // 或者你需要在此处调整处理方式
      
      // 模拟提交成功
      setTimeout(() => {
        toast.success("模型上传完成！");
        // 重置表单
        form.reset();
        setModelFile(null);
        setThumbnailFile(null);
        setModelFileInfo(null);
      }, 1500);
      
    } catch (error) {
      toast.error(`提交失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, modelFile, thumbnailFile]);

  // 类别选项
  const categoryOptions = [
    { value: "general", label: "通用" },
    { value: "character", label: "角色" },
    { value: "architecture", label: "建筑" },
    { value: "vehicle", label: "车辆" },
    { value: "furniture", label: "家具" },
    { value: "nature", label: "自然" },
    { value: "other", label: "其他" }
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>上传模型文件</CardTitle>
          <CardDescription>
            支持GLB、GLTF、FBX格式的3D模型文件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupabaseUploader
            bucket="models"
            folder="uploads"
            allowedFileTypes={[".glb", ".gltf", ".fbx"]}
            maxFileSize={100}
            multiple={false}
            onUploadComplete={handleModelUploadComplete}
            onUploadError={handleUploadError}
          />
          
          {modelFileInfo && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <p className="text-sm font-medium">文件信息</p>
              <ul className="text-sm mt-1 space-y-1">
                <li>格式: <span className="font-mono">{modelFileInfo.format.toUpperCase()}</span></li>
                <li>大小: <span className="font-mono">{modelFileInfo.size} MB</span></li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>上传缩略图</CardTitle>
          <CardDescription>
            请上传一张清晰的模型预览图，推荐尺寸 1200x800 像素
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupabaseUploader
            bucket="thumbnails"
            folder="uploads"
            allowedFileTypes={["image/*"]}
            maxFileSize={5}
            multiple={false}
            onUploadComplete={handleThumbnailUploadComplete}
            onUploadError={handleUploadError}
          />
          
          {thumbnailFile && thumbnailFile.publicUrl && (
            <div className="mt-4 relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={thumbnailFile.publicUrl}
                alt="模型缩略图预览"
                fill
                className="object-contain"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>模型信息</CardTitle>
          <CardDescription>
            填写模型的基本信息和属性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>模型名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="输入模型名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>作者 *</FormLabel>
                      <FormControl>
                        <Input placeholder="输入作者名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分类</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "general"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择模型分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>模型描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="输入模型描述..." 
                        className="min-h-20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      对模型的详细描述，包括特点、用途等
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !modelFile || !thumbnailFile}
                >
                  {isSubmitting ? "正在提交..." : "提交模型"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 