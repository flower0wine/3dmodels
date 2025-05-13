"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Meteors } from "@/components/ui/meteors";
import { useEffect } from "react";
import { Button as UIButton } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
// 注释掉未使用的导入
// import { TextRevealCard, TextRevealCardTitle, TextRevealCardDescription } from "@/components/ui/text-reveal";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // 禁止页面滚动
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-background/95 backdrop-blur-lg z-50">
        {/* 流星效果 - 更密集且速度更快 */}
        <Meteors
          number={80}
          className="opacity-50"
        />

        {/* 中央内容区域 - 使用 3D 卡片 */}
        <CardContainer className="inter-var">
          <CardBody className="relative group/card bg-black/40 dark:bg-black/40 border border-primary/20 backdrop-blur-md w-auto sm:w-[30rem] h-auto rounded-xl p-8">
            {/* 404 标题 - 使用动画效果 */}
            <CardItem
              translateZ="50"
              className="w-full"
            >
              <motion.h1
                className="text-7xl font-bold text-primary text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeOut"
                }}
              >
                404
              </motion.h1>
            </CardItem>

            {/* 页面未找到文本 */}
            <CardItem
              translateZ="60"
              className="w-full mt-4"
            >
              <motion.h2 
                className="text-xl md:text-2xl font-bold text-foreground text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                页面未找到
              </motion.h2>
              <motion.p
                className="text-sm text-muted-foreground max-w-xs mx-auto text-center mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                您访问的页面不存在或已被移除，请检查链接是否正确。
              </motion.p>
            </CardItem>

            {/* 按钮区域 - 使用 Moving Border */}
            <CardItem
              translateZ="30"
              className="w-full mt-8 flex justify-center"
            >
              <MovingBorderButton
                borderRadius="0.5rem"
                containerClassName="w-full max-w-xs"
                className="bg-background border-primary/20 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-colors w-full"
                onClick={() => router.push("/")}
              >
                返回首页
              </MovingBorderButton>
            </CardItem>
            
            <CardItem
              translateZ="20"
              className="w-full mt-4"
            >
              <UIButton 
                onClick={() => router.back()}
                variant="link"
                className="text-muted-foreground hover:text-foreground mx-auto block"
              >
                返回上一页
              </UIButton>
            </CardItem>
          </CardBody>
        </CardContainer>

        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="fixed bottom-4 text-xs text-muted-foreground/60"
        >
          探索更多 3D 模型内容
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 