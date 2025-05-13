import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user"; // 假设有用户类型定义

interface NavbarUserAvatarProps {
  user: User | null;
  onClick?: () => void;
  className?: string;
}

export const NavbarUserAvatar: React.FC<NavbarUserAvatarProps> = ({
  user,
  onClick,
  className = ""
}) => {
  if (!user) return null;
  
  // 获取用户名首字母
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = user.name ? getInitials(user.name) : user.email?.[0]?.toUpperCase() || '用';

  return (
    <Avatar 
      onClick={onClick} 
      className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 ${className}`}
    >
      <AvatarImage 
        src={user.avatar || ''} 
        alt={user.name || user.email || '用户头像'} 
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}; 