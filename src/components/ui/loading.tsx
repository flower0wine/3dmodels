 "use client";

 import {
   ClipLoader,
   BeatLoader,
   PulseLoader,
   ScaleLoader,
 } from "react-spinners";

 type LoadingProps = {
   size?: number;
   color?: string;
   className?: string;
 };

 export function FormLoadingSpinner({
   size = 15,
   color = "#3b82f6",
   className = "",
 }: LoadingProps) {
   return (
     <div className={`flex justify-center items-center py-6 ${className}`}>
       <BeatLoader color={color} size={size} />
     </div>
   );
 }

 export function ContentLoadingSpinner({
   size = 35,
   color = "#3b82f6",
   className = "",
 }: LoadingProps) {
   return (
     <div className={`flex justify-center items-center p-4 ${className}`}>
       <ClipLoader color={color} size={size} />
     </div>
   );
 }

 export function ButtonLoadingSpinner({
   size = 8,
   color = "currentColor",
   className = "",
 }: LoadingProps) {
   return <PulseLoader color={color} size={size} className={className} />;
 }

 export function PageLoadingSpinner({
   size = 50,
   color = "#3b82f6",
   className = "",
 }: LoadingProps) {
   return (
     <div
       className={`flex justify-center items-center min-h-[200px] ${className}`}
     >
       <ScaleLoader color={color} height={size} />
     </div>
   );
 }