"use client";

import React from "react";
import { User } from "@/types/user"; // 假设有用户类型定义
import { NavbarLogo } from "./NavbarLogo";
import { NavbarAuth } from "./NavbarAuth";

interface NavbarProps {
  user: User | null;
  logoSrc: string;
  logoAlt?: string;
  logoHref?: string;
  className?: string;
  sticky?: boolean;
  bordered?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  logoSrc,
  logoAlt,
  logoHref,
  className = "",
  sticky = true,
  bordered = true,
}) => {
  return (
    <header className={`
      w-full bg-background z-50 ${sticky ? 'sticky top-0' : ''}
      ${bordered ? 'border-b border-border' : ''}
      ${className}
    `}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <NavbarLogo 
          logoSrc={logoSrc} 
          alt={logoAlt}
          href={logoHref}
        />
        
        <NavbarAuth user={user} />
      </div>
    </header>
  );
}; 