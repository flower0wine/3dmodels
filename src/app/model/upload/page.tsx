import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import FormModel from "@/components/form/FormModel";
import LayoutPageHeader from "@/components/layout/LayoutPageHeader";

export const dynamic = 'force-dynamic';

export default async function UploadModelPage() {
  // 创建空查询客户端，上传时不需要预获取数据
  const queryClient = new QueryClient();
  
  return (
    <main className="min-h-screen py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <LayoutPageHeader 
          title="上传模型"
          description="上传新的3D模型文件"
          backLink="/"
          backLinkText="返回首页"
        />
        
        <div className="mt-8">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <FormModel />
          </HydrationBoundary>
        </div>
      </div>
    </main>
  );
} 