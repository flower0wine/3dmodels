"use client";

import { motion } from "motion/react";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PulsatingErrorProps {
  size?: number;
  className?: string;
}

export const PulsatingError = ({ size = 64, className }: PulsatingErrorProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* 脉动背景圆圈 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full bg-destructive/30 blur-md"
        style={{
          width: size,
          height: size,
        }}
      />
      
      {/* 脉动外环 */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
        className="absolute inset-0 rounded-full border-2 border-destructive/50"
        style={{
          width: size,
          height: size,
        }}
      />

      {/* 错误图标 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 0.5,
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror",
          }
        }}
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        <XCircle 
          className="text-destructive" 
          size={size * 0.8} 
          strokeWidth={2}
        />
      </motion.div>
    </div>
  );
}; 