import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

/**
 * 生成唯一的文件路径
 * @param fileName 原始文件名
 * @param folder 可选的文件夹
 * @returns 唯一的文件路径
 */
export function generateUniqueFilePath(fileName: string, folder?: string): string {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 10);
  const extension = fileName.split('.').pop() || '';
  const baseName = fileName.split('.').slice(0, -1).join('.') || 'file';
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  
  const uniqueFileName = `${sanitizedBaseName}_${timestamp}_${random}.${extension}`;
  return folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
}