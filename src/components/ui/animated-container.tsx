"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type AnimatedContainerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function AnimatedContainer({ 
  children, 
  className = "",
  delay = 0
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleAnimatedContainer({ 
  children, 
  className = "",
  delay = 0
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedText({ 
  children, 
  className = "",
  delay = 0
}: AnimatedContainerProps) {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.p>
  );
}

export function AnimatedHeading({ 
  children, 
  className = "",
  delay = 0
}: AnimatedContainerProps) {
  return (
    <motion.h2
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.h2>
  );
} 