import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ProviderReactQuery from "@/components/provider/ProviderReactQuery";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar/Navbar";
import { getUser } from "@/lib/supabase/auth";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3D模型展示网站",
  description: "展示各种3D模型的在线平台",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 获取当前用户
  const { data } = await getUser();
  const user = data.user;
  
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Navbar 
          user={user} 
          logoSrc="/logo.png" 
          logoAlt="3D Show Logo" 
        />
        <main>
          <ProviderReactQuery>
            {children}
          </ProviderReactQuery>
          <Toaster />
        </main>
      </body>
    </html>
  );
}
