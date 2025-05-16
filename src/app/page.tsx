import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import GridModelMasonry from "@/components/grid/GridModelMasonry";
import LayoutPageHeader from "@/components/layout/LayoutPageHeader";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 在服务端预取数据
  const queryClient = new QueryClient();
  
  return (
    <>
      <main className="min-h-screen py-4 sm:py-6 md:py-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="px-3 sm:px-6 lg:px-8 mb-4 sm:mb-6">
            <LayoutPageHeader 
              title="3D模型展示"
              description="探索高质量的3D模型集合，支持多种格式的模型预览"
            />
          </div>
          
          <HydrationBoundary state={dehydrate(queryClient)}>
            <GridModelMasonry />
          </HydrationBoundary>
        </div>
      </main>
    </>
  );
}
