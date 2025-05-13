import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NavbarAuthButtonProps {
  className?: string;
}

export const NavbarAuthButton: React.FC<NavbarAuthButtonProps> = ({
  className = ""
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button asChild variant="outline" size="sm">
        <Link href="/auth?tabs=login">登录</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth?tabs=register">注册</Link>
      </Button>
    </div>
  );
}; 