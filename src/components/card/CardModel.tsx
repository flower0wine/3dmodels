"use client";

import { useState } from "react";
import Image from "next/image";
import { Model } from "@/types/model";
import DrawerModelViewer from "@/components/model/DrawerModelViewer";

interface CardModelProps {
  model: Model;
}

export default function CardModel({ model }: CardModelProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div 
        className="w-full rounded-lg overflow-hidden shadow-md bg-white dark:bg-zinc-900 hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] mb-4"
        onClick={() => setIsDrawerOpen(true)}
      >
        <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2]">
          <Image
            src={model.thumbnail_path}
            alt={model.name}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={false}
            loading="lazy"
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold truncate">{model.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">作者: {model.author}</p>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              {model.format.toUpperCase()}
            </span>
            {model.file_size && (
              <span className="text-xs">{Math.round(model.file_size / 1024)} KB</span>
            )}
          </div>
        </div>
      </div>
      
      <DrawerModelViewer 
        model={model}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
} 