"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type AnimatedAlertProps = {
  show: boolean;
  children: ReactNode;
  variant?: "default" | "destructive" | "success";
  icon?: ReactNode;
  onClose?: () => void;
};

export function AnimatedAlert({
  show,
  children,
  variant = "default",
  icon,
  onClose,
}: AnimatedAlertProps) {
  const getIcon = () => {
    if (icon) return icon;
    
    if (variant === "destructive") {
      return <AlertCircle className="h-4 w-4" />;
    }
    
    if (variant === "success") {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    
    return null;
  };
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Alert variant={variant === "success" ? "default" : variant}>
            {getIcon()}
            <AlertDescription>{children}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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