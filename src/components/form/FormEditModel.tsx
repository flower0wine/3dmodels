"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModel } from "@/hooks/useModels";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, UploadCloud, Save, XCircle, FileEdit } from "lucide-react";
import { UppyFileUploader } from "@/components/upload/UppyFileUploader";

import { uploadFile } from "@/lib/supabase/storage";
import { updateModel, deleteModel } from "@/lib/supabase/models";
import { generateUniqueFilePath } from "@/lib/utils";

// 表单验证schema
const editModelSchema = z.object({
  name: z.string().min(2, "名称至少需要2个字符").max(100, "名称不能超过100个字符"),
  description: z.string().max(500, "描述不能超过500个字符").optional(),
  category: z.string().max(50, "分类不能超过50个字符").optional(),
});

type EditModelFormValues = z.infer<typeof editModelSchema>;

interface FormEditModelProps {
  modelId: string;
}

export default function FormEditModel({ modelId }: FormEditModelProps) {
  const router = useRouter();
  const { data: model, isLoading, error } = useModel(modelId);
  
  // 文件上传状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingType, setUploadingType] = useState<'thumbnail' | 'model' | null>(null);
  
  // 文件选择引用
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // 选择的文件
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadedModelFile, setUploadedModelFile] = useState<{url: string, format: string, size: number} | null>(null);
  
  // 预览
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [showModelUploader, setShowModelUploader] = useState(false);
  
  // 表单初始化
  const form = useForm<EditModelFormValues>({
    resolver: zodResolver(editModelSchema),
    defaultValues: {
      name: model?.name || "",
      description: model?.description || "",
      category: model?.category || "",
    },
    values: {
      name: model?.name || "",
      description: model?.description || "",
      category: model?.category || "",
    },
  });
  
  // 点击选择缩略图
  const handleThumbnailClick = () => {
    thumbnailInputRef.current?.click();
  };
  
  // 处理缩略图选择
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("请选择有效的图片文件 (JPG, PNG, WebP)");
      return;
    }
    
    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过5MB");
      return;
    }
    
    // 设置选中的文件
    setSelectedThumbnail(file);
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };
  
  // 清除选择的缩略图
  const clearThumbnail = () => {
    setSelectedThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };
  
  // 处理模型文件上传完成
  const handleModelUploadComplete = useCallback((files: any[]) => {
    if (files.length > 0) {
      const uploadedFile = files[0];
      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
      
      setUploadedModelFile({
        url: uploadedFile.url,
        format: fileExt,
        size: uploadedFile.size
      });
      
      setShowModelUploader(false);
      toast.success("模型文件上传成功");
    }
  }, []);
  
  // 处理表单提交
  const onSubmit = async (values: EditModelFormValues) => {
    if (!model) return;
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // 准备更新数据
      const updateData: Record<string, any> = {
        name: values.name,
        description: values.description || null,
        category: values.category || null,
      };
      
      console.log("要更新的数据:", updateData, "模型ID:", modelId);
      
      // 上传新的缩略图（如果有）
      if (selectedThumbnail) {
        setUploadingType('thumbnail');
        const uniquePath = generateUniqueFilePath(selectedThumbnail.name);
        
        const { data: uploadResult, error: uploadError } = await uploadFile(
          'thumbnails',
          uniquePath,
          selectedThumbnail,
          { upsert: true }
        );

        console.log("上传缩略图结果:", uploadResult);
        
        if (uploadError) {
          throw new Error(`上传缩略图失败: ${uploadError.message}`);
        }
        
        if (uploadResult?.publicUrl) {
          updateData.thumbnail_path = uploadResult.publicUrl;
          console.log("新的缩略图路径:", uploadResult.publicUrl);
        }
        
        setUploadProgress(50);
      }
      
      // 如果有上传的模型文件
      if (uploadedModelFile) {
        updateData.storage_path = uploadedModelFile.url;
        updateData.format = uploadedModelFile.format;
        updateData.file_size = uploadedModelFile.size;
        console.log("新的模型文件信息:", uploadedModelFile);
        
        setUploadProgress(80);
      }
      
      // 更新模型信息
      await updateModel(modelId, updateData);
      setUploadProgress(100);
      toast.success("模型更新成功");
      
      // 更新完成后重定向到模型详情页
      router.refresh();
      router.push("/");
    } catch (error: any) {
      console.error("更新模型失败详情:", error);
      toast.error(`更新失败: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadingType(null);
    }
  };
  
  // 处理删除模型
  const handleDeleteModel = async () => {
    if (!model) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteModel(modelId);
      toast.success("模型已成功删除");
      router.refresh();
      router.push("/");
    } catch (error: any) {
      console.error("删除模型失败:", error);
      toast.error(error.message || "删除模型失败");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 如果正在加载或发生错误
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !model) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">加载模型信息失败</p>
            <Button onClick={() => router.push("/")}>返回首页</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>修改模型的基本信息</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>模型名称</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="输入模型名称" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>模型描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="输入模型描述（可选）" 
                        className="min-h-[100px]"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      详细描述这个模型的特点、用途等信息
                    </FormDescription>
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
                    <FormControl>
                      <Input 
                        placeholder="输入模型分类（可选）" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      为模型添加一个分类，便于管理和查找
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 缩略图上传 */}
                <div>
                  <FormLabel className="block mb-2">模型缩略图</FormLabel>
                  <div className="space-y-4">
                    <div
                      className="relative border-2 border-dashed rounded-lg p-4 h-[200px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      onClick={handleThumbnailClick}
                    >
                      {thumbnailPreview || model.thumbnail_path ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={thumbnailPreview || model.thumbnail_path}
                            alt="缩略图预览"
                            fill
                            className="object-contain rounded-lg"
                          />
                          {thumbnailPreview && (
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearThumbnail();
                              }}
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm text-gray-500">
                            点击上传缩略图
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            支持 JPG, PNG, WebP 格式
                          </p>
                        </>
                      )}
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleThumbnailChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    {selectedThumbnail && (
                      <p className="text-xs text-gray-500">
                        已选择: {selectedThumbnail.name} ({Math.round(selectedThumbnail.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 模型文件上传 */}
                <div>
                  <FormLabel className="block mb-2">模型文件</FormLabel>
                  <div className="space-y-4">
                    {!showModelUploader ? (
                      <div 
                        className="relative border-2 border-dashed rounded-lg p-4 h-[200px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        onClick={() => setShowModelUploader(true)}
                      >
                        {uploadedModelFile ? (
                          <div className="flex flex-col items-center justify-center h-full">
                            <FileEdit className="h-12 w-12 text-blue-500 mb-4" />
                            <p className="text-sm font-medium">已上传新模型文件</p>
                            <p className="text-xs text-gray-500 mt-1">
                              格式: {uploadedModelFile.format.toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              大小: {Math.round(uploadedModelFile.size / 1024 / 1024)} MB
                            </p>
                            <button
                              type="button"
                              className="mt-4 flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedModelFile(null);
                              }}
                            >
                              <XCircle size={12} className="mr-1" /> 移除
                            </button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm text-gray-500">
                              点击上传新模型文件
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              当前格式: {model.format.toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              当前大小: {Math.round((model.file_size || 0) / 1024 / 1024)} MB
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-semibold">上传模型文件</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowModelUploader(false)}
                          >
                            <XCircle size={16} className="mr-1" />
                            关闭
                          </Button>
                        </div>
                        
                        <UppyFileUploader 
                          bucket="models"
                          folder={`models/${modelId}`}
                          allowedFileTypes={[".glb", ".gltf", ".obj", ".fbx", ".stl"]}
                          multiple={false}
                          height="250px"
                          autoUpload={true}
                          note="支持上传大型3D模型文件"
                          onUploadComplete={handleModelUploadComplete}
                          onUploadError={(err) => toast.error(`上传失败: ${err.message}`)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploadingType === 'thumbnail' ? '上传缩略图' : uploadingType === 'model' ? '上传模型文件' : '更新模型信息'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                
                <div className="flex gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除模型
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确定要删除这个模型吗？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作不可逆，删除后模型数据将无法恢复。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteModel}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        保存修改
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 