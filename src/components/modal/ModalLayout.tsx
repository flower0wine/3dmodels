"use client";

import { useEffect } from "react";
import { cva } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";

interface ModalLayoutProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const modalVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", damping: 20, stiffness: 300 } 
  },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalSizeClasses = cva(
  "bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-[90%] max-h-[90vh] overflow-y-auto relative",
  {
    variants: {
      size: {
        sm: "max-w-md",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl"
      }
    },
    defaultVariants: {
      size: "lg"
    }
  }
);

export default function ModalLayout({ title, onClose, children, size = "lg" }: ModalLayoutProps) {
  // 处理ESC键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 点击背景关闭弹窗，点击内容不关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={handleBackdropClick}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
      >
        <motion.div 
          className={modalSizeClasses({ size })}
          variants={modalVariants}
        >
          <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button 
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="关闭"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 