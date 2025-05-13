"use client";

import React from "react";
import { User } from "@/types/user"; // 假设有用户类型定义
import { NavbarAuthButton } from "./NavbarAuthButton";
import { NavbarUserMenu } from "./NavbarUserMenu";
import { NavbarUploadButton } from "./NavbarUploadButton";

interface NavbarAuthProps {
  user: User | null;
  className?: string;
}

export const NavbarAuth: React.FC<NavbarAuthProps> = ({
  user,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {user && (
        <NavbarUploadButton />
      )}
      {user ? <NavbarUserMenu user={user} /> : <NavbarAuthButton />}
    </div>
  );
}; 