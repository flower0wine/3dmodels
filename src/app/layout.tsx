import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ProviderReactQuery from "@/components/provider/ProviderReactQuery";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ProviderReactQuery>
            {children}
        </ProviderReactQuery>
      </body>
    </html>
  );
}
