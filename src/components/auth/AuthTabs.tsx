"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import FormLogin from "@/components/auth/FormLogin";
import FormRegister from "@/components/auth/FormRegister";
import { FormLoadingSpinner } from "@/components/ui/loading";
import { useSearchParams } from "next/navigation";

interface AuthTabsProps {
  defaultTab?: string;
  showTerms?: boolean;
}

export default function AuthTabs({
  showTerms = false,
}: AuthTabsProps) {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab") ?? "login";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">登录</TabsTrigger>
        <TabsTrigger value="register">注册</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>用户登录</CardTitle>
            <CardDescription>输入您的邮箱和密码登录您的账户</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<FormLoadingSpinner />}>
              <FormLogin />
            </Suspense>
          </CardContent>
          {showTerms && (
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              <p>登录即表示您同意我们的服务条款和隐私政策</p>
            </CardFooter>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>创建账户</CardTitle>
            <CardDescription>注册一个新账户以使用所有功能</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<FormLoadingSpinner />}>
              <FormRegister />
            </Suspense>
          </CardContent>
          {showTerms && (
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              <p>注册即表示您同意我们的服务条款和隐私政策</p>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
