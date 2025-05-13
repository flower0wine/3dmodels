"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLoadingSpinner } from "@/components/ui/loading";
import { signOut } from "@/lib/supabase/auth";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function LogoutButton({ 
  variant = "default", 
  size = "default",
  className = ""
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await signOut();
      
      // 刷新页面并跳转到首页
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("登出失败", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout} 
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <ButtonLoadingSpinner className="mr-2" />
          登出中...
        </>
      ) : (
        "退出登录"
      )}
    </Button>
  );
} 