import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getModelById } from "@/lib/supabase/models";
import FormEditModel from "@/components/form/FormEditModel";
import LayoutPageHeader from "@/components/layout/LayoutPageHeader";

interface EditModelPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function EditModelPage({ params }: EditModelPageProps) {
  const { id } = await params;
  
  // 预获取模型信息
  const queryClient = new QueryClient();
  
  // 获取模型详情
  const model = await getModelById(id);
  
  // 如果模型不存在，返回404
  if (!model) {
    notFound();
  }
  
  // 预填充查询缓存
  await queryClient.prefetchQuery({
    queryKey: ["model", id],
    queryFn: () => model,
  });
  
  return (
    <main className="min-h-screen py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <LayoutPageHeader 
          title="编辑模型"
          description="修改模型信息和文件"
          backLink="/"
          backLinkText="返回首页"
        />
        
        <div className="mt-8">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <FormEditModel modelId={id} />
          </HydrationBoundary>
        </div>
      </div>
    </main>
  );
} 