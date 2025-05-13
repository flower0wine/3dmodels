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
import { FadeUp, FadeScale, MotionH2, MotionP } from "@/components/ui/motion";
import { FormLoadingSpinner } from "@/components/ui/loading";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Meteors } from "@/components/ui/meteors";
import { Spotlight } from "@/components/ui/spotlight";

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      {/* 背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <BackgroundBeams className="opacity-30" />
        <Meteors className="opacity-30" />
        <Spotlight className="opacity-20" fill="hsl(var(--primary))" />
      </div>

      <FadeUp className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <MotionH2
            className="mt-6 text-3xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            欢迎使用3D模型平台
          </MotionH2>
          <MotionP
            className="mt-2 text-sm text-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            登录或注册以开始探索和分享3D创作
          </MotionP>
        </div>

        <FadeScale transition={{ duration: 0.5, delay: 0.4 }}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>用户登录</CardTitle>
                  <CardDescription>
                    输入您的邮箱和密码登录您的账户
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<FormLoadingSpinner />}>
                    <FormLogin />
                  </Suspense>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                  <p>登录即表示您同意我们的服务条款和隐私政策</p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-primary/10 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>创建账户</CardTitle>
                  <CardDescription>
                    注册一个新账户以使用所有功能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<FormLoadingSpinner />}>
                    <FormRegister />
                  </Suspense>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                  <p>注册即表示您同意我们的服务条款和隐私政策</p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeScale>
      </FadeUp>
    </div>
  );
}
