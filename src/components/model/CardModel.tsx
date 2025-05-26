"use client";

import { useState } from "react";
import Image from "next/image";
import { Model } from "@/types/model";
import DrawerModelViewer from "@/components/model/DrawerModelViewer";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteModel } from "@/lib/supabase/models";
import { useRouter } from "next/navigation";

interface CardModelProps {
  model: Model;
  showEditButton?: boolean;
}

export default function CardModel({ model, showEditButton = false }: CardModelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // 处理删除模型
  const handleDeleteModel = async () => {
    try {
      setIsDeleting(true);
      await deleteModel(model.id);
      toast.success("模型已成功删除");
      router.refresh();
    } catch (error: any) {
      console.error("删除模型失败:", error);
      toast.error(error.message || "删除模型失败");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div 
        className="w-full rounded-lg overflow-hidden shadow-md bg-white dark:bg-zinc-900 hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] mb-4 group relative"
        onClick={() => setIsDrawerOpen(true)}
      >
        <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2]">
          <Image
            src={model.thumbnail_path}
            alt={model.name}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={true}
          />
          {showEditButton && (
            <div 
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black/60 hover:bg-red-600/80 text-white border-none gap-1.5"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="text-xs">删除</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      确定要删除这个模型吗？
                    </AlertDialogTitle>
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
                      {isDeleting ? "删除中..." : "确认删除"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Link href={`/model/edit/${model.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-black/60 hover:bg-black/80 text-white border-none gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="text-xs">编辑</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold truncate">{model.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">作者: {model.author}</p>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              {model.format.toUpperCase()}
            </span>
            {model.file_size && (
              <span className="text-xs">{Math.round(model.file_size / 1024)} KB</span>
            )}
          </div>
        </div>
      </div>
      
      <DrawerModelViewer 
        model={model}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
} 