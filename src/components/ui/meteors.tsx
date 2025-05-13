"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { useEffect, useState, useRef } from "react";
import { debounce } from "lodash-es";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 50).fill(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1900); // 默认宽度，会被更新

  useEffect(() => {
    // 获取容器宽度的函数
    const updateWidth = () => {
      if (containerRef.current?.parentElement) {
        // 使用父元素宽度，因为 meteors 容器本身可能没有明确的宽度
        const width = containerRef.current.parentElement.clientWidth;
        setContainerWidth(width > 0 ? width : window.innerWidth);
      } else {
        // 回退到窗口宽度
        setContainerWidth(window.innerWidth);
      }
    };

    // 创建防抖版本的更新函数
    const debouncedUpdateWidth = debounce(updateWidth, 200);

    // 初始更新
    updateWidth();

    // 添加窗口大小变化监听
    window.addEventListener("resize", debouncedUpdateWidth);

    // 清理函数
    return () => {
      window.removeEventListener("resize", debouncedUpdateWidth);
      debouncedUpdateWidth.cancel(); // 取消可能待处理的防抖调用
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0"
    >
      {meteors.map((el, idx) => {
        const meteorCount = number || 20;
        // 使用动态容器宽度，均匀分布流星
        const position = idx * (containerWidth / meteorCount) - containerWidth / 4;

        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
              "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
              className,
            )}
            style={{
              top: "-40px", // 从容器上方开始
              left: position + "px",
              animationDelay: Math.random() * 5 + "s", // 随机延迟 0-5s
              animationDuration: Math.floor(Math.random() * (10 - 5) + 5) + "s", // 随机持续时间 5-10s
            }}
          ></span>
        );
      })}
    </motion.div>
  );
};
