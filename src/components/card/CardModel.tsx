"use client";

import { useState } from "react";
import Image from "next/image";
import { Model } from "@/types/model";
import ModalModelViewer from "@/components/modal/ModalModelViewer";

interface CardModelProps {
  model: Model;
}

export default function CardModel({ model }: CardModelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-zinc-900 cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-48 w-full">
          <Image
            src={model.thumbnail_path}
            alt={model.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{model.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">作者: {model.author}</p>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{model.format.toUpperCase()}</span>
            {/* <span>{Math.round(model.file_size / 1024)} KB</span> */}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ModalModelViewer model={model} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
} 