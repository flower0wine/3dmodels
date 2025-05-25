import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import GridModelMasonry from "@/components/model/GridModelMasonry";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MyModelsPage() {
  // 创建查询客户端
  const queryClient = new QueryClient();
  
  return (
    <main className="min-h-screen py-4 sm:py-6 md:py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="px-3 sm:px-6 lg:px-8 mb-8">
          <div className="mb-4">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              返回首页
            </Link>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            我的模型
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            管理您上传的所有3D模型
          </p>
        </div>
        
        <HydrationBoundary state={dehydrate(queryClient)}>
          <GridModelMasonry isUserModels={true} />
        </HydrationBoundary>
      </div>
    </main>
  );
} 