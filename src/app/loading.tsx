"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PuffLoader } from "react-spinners";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Meteors } from "@/components/ui/meteors";

export default function Loading() {
  useEffect(() => {
    // 禁止页面滚动
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-background/80 backdrop-blur-sm z-50">
        {/* 聚光灯效果 */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="hsl(var(--primary) / 0.2)"
        />

        {/* 中央加载区域 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="relative flex items-center justify-center">
            {/* 发光背景 */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-40 h-40 rounded-full bg-primary/10 blur-3xl"
            />

            {/* 外环 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-40 h-40 rounded-full border border-primary/20"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-60 h-60 rounded-full border border-primary/10"
            />

            {/* 加载动画 */}
            <PuffLoader 
              color="hsl(var(--primary))" 
              size={100} 
              className="z-10"
            />
          </div>
        </motion.div>

        {/* 底部装饰元素 */}
        <div className="fixed bottom-0 inset-x-0 h-1/3 z-0">
          <BackgroundBeams
            className="opacity-30"
          />
        </div>

        {/* 流星效果 */}
        <Meteors
          number={15}
          className="opacity-30"
        />
      </div>
    </AnimatePresence>
  );
} 