interface LayoutPageHeaderProps {
  title: string;
  description: string;
  backLink?: string;
  backLinkText?: string;
}

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function LayoutPageHeader({ 
  title, 
  description, 
  backLink, 
  backLinkText = "返回" 
}: LayoutPageHeaderProps) {
  return (
    <header className="mb-8 sm:mb-12">
      {backLink && (
        <div className="mb-4">
          <Link 
            href={backLink}
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {backLinkText}
          </Link>
        </div>
      )}
      
      <div className={`${backLink ? "text-left" : "text-center"}`}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">{title}</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          {description}
        </p>
      </div>
    </header>
  );
} 