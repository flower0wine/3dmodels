"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Meteors } from "@/components/ui/meteors";
import { useEffect } from "react";
import { PulsatingError } from "@/components/ui/pulsating-error";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 报告错误到错误跟踪服务
    console.error("应用程序错误:", error);
    
    // 禁止页面滚动
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [error]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-background/90 backdrop-blur-md z-50">
        {/* 聚光灯效果 - 位置不同于loading页面 */}
        <Spotlight
          className="top-0 right-0 md:right-60 md:top-20"
          fill="hsl(var(--destructive) / 0.3)"
        />

        {/* 中央错误区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <div className="relative flex flex-col items-center justify-center space-y-6">
            {/* 发光背景 - 使用红色调 */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-52 h-52 rounded-full bg-destructive/20 blur-3xl"
            />

            {/* 外环 - 使用不同的动画和颜色 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-48 h-48 rounded-full border border-destructive/30"
            />

            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-64 h-64 rounded-full border border-destructive/20"
            />

            {/* 错误图标 */}
            <PulsatingError size={80} />

            {/* 错误信息 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-foreground space-y-4 max-w-md"
            >
              <h2 className="text-2xl font-bold">出现错误</h2>
              <p className="text-muted-foreground text-sm">
                {error.message || "应用程序发生了意外错误，请尝试重新加载页面"}
              </p>
              <div className="pt-4">
                <Button 
                  onClick={reset}
                  variant="destructive"
                  className="px-6"
                >
                  重试
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 底部装饰元素 - 不同位置 */}
        <div className="fixed top-0 inset-x-0 h-1/3 z-0 rotate-180">
          <BackgroundBeams
            className="opacity-20"
          />
        </div>

        {/* 流星效果 - 更多流星 */}
        <Meteors
          number={25}
          className="opacity-40"
        />
      </div>
    </AnimatePresence>
  );
} 