"use client";

import React from "react";
import Link from "next/link";
import { User } from "@/types/user"; // 假设有用户类型定义
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavbarUserAvatar } from "./NavbarUserAvatar";
import LogoutButton from "@/components/auth/LogoutButton";

interface NavbarUserMenuProps {
  user: User | null;
  className?: string;
}

export const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({
  user,
  className = ""
}) => {
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        <NavbarUserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>{user.name || '用户'}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/model" className="cursor-pointer flex w-full items-center">
            <span className="mr-2 h-4 w-4 icon-[mage--box-3d-scan]" />
            <span>我的模型</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogoutButton 
            variant="ghost" 
            size="sm" 
            className="cursor-pointer flex w-full items-center p-0 h-auto font-normal"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 