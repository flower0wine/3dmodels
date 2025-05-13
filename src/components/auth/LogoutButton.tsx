"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/api/auth";
import { useUserStore } from "@/store/userStore";
import { ButtonLoadingSpinner } from "@/components/ui/loading";

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
  
  // 使用用户 store
  const storeLogout = useUserStore(state => state.logout);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // 调用 API 登出
      await logout();
      
      // 清除本地存储的用户信息
      storeLogout();
      
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