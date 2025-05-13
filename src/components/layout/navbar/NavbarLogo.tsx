import React from "react";
import Link from "next/link";
import Image from "next/image";

interface NavbarLogoProps {
  logoSrc: string;
  alt?: string;
  href?: string;
  className?: string;
}

export const NavbarLogo: React.FC<NavbarLogoProps> = ({
  logoSrc,
  alt = "网站Logo",
  href = "/",
  className = ""
}) => {
  return (
    <Link href={href} className={`flex items-center ${className}`}>
      <Image 
        src={logoSrc} 
        alt={alt} 
        width={120} 
        height={40} 
        className="object-contain h-8 w-auto"
      />
    </Link>
  );
}; 