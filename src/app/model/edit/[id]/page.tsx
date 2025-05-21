import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import FormModel from "@/components/form/FormModel";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface EditModelPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function EditModelPage({ params }: EditModelPageProps) {
  const { id } = await params;
  
  // 预获取模型信息
  const queryClient = new QueryClient();
  
  return (
    <main className="min-h-screen py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回首页
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            编辑模型
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            修改模型信息和文件
          </p>
        </div>
        
        <div className="mt-8">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <FormModel modelId={id} />
          </HydrationBoundary>
        </div>
      </div>
    </main>
  );
} 