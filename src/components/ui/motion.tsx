"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// 预定义的动画效果
export const animations = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  expandVertical: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
  },
};

// 针对各个元素的 Motion 组件
export const MotionDiv = motion.div;
export const MotionP = motion.p;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionH3 = motion.h3;
export const MotionSpan = motion.span;
export const MotionUl = motion.ul;
export const MotionLi = motion.li;

// 创建基础动画组件 - 默认使用 div
export type BaseMotionProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
};

export const FadeIn = forwardRef<HTMLDivElement, BaseMotionProps>(
  ({ children, className = "", ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = "FadeIn";

export const FadeUp = forwardRef<HTMLDivElement, BaseMotionProps>(
  ({ children, className = "", ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeUp.displayName = "FadeUp";

export const FadeScale = forwardRef<HTMLDivElement, BaseMotionProps>(
  ({ children, className = "", ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeScale.displayName = "FadeScale";

export const ExpandVertical = forwardRef<HTMLDivElement, BaseMotionProps>(
  ({ children, className = "", ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ExpandVertical.displayName = "ExpandVertical";

// 添加警告组件
export function AnimatedAlert({
  show,
  children,
  variant = "default",
}: {
  show: boolean;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "success";
}) {
  return (
    <AnimatePresence>
      {show && (
        <ExpandVertical>
          <Alert variant={variant === "success" ? "default" : variant}>
            {variant === "destructive" && <AlertCircle className="h-4 w-4" />}
            {variant === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            <AlertDescription>{children}</AlertDescription>
          </Alert>
        </ExpandVertical>
      )}
    </AnimatePresence>
  );
}

// 添加成功消息组件
export function AnimatedSuccessMessage({
  show,
  title,
  description,
  className = "",
}: {
  show: boolean;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    show ? (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center p-4 ${className}`}
      >
        <div className="rounded-full bg-green-100 p-3 inline-flex mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
      </motion.div>
    ) : null
  );
}
