"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "@radix-ui/react-icons";

interface NavbarUploadButtonProps {
  className?: string;
}

export const NavbarUploadButton: React.FC<NavbarUploadButtonProps> = ({
  className = ""
}) => {
  return (
    <Button asChild variant="default" size="sm" className={`${className}`}>
      <Link href="/model/upload" className="flex items-center gap-1">
        <UploadIcon className="h-4 w-4" />
        <span>上传模型</span>
      </Link>
    </Button>
  );
}; 