import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import FormLogin from "@/components/auth/FormLogin";
import FormRegister from "@/components/auth/FormRegister";
import { AnimatedContainer, AnimatedHeading, AnimatedText, ScaleAnimatedContainer } from "@/components/ui/animated-container";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <AnimatedContainer className="w-full max-w-md space-y-8">
        <div className="text-center">
          <AnimatedHeading 
            className="mt-6 text-3xl font-bold tracking-tight text-gray-900"
            delay={0.2}
          >
            欢迎使用3D模型平台
          </AnimatedHeading>
          <AnimatedText 
            className="mt-2 text-sm text-gray-600"
            delay={0.3}
          >
            登录或注册以开始探索和分享3D创作
          </AnimatedText>
        </div>

        <ScaleAnimatedContainer delay={0.4}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>用户登录</CardTitle>
                  <CardDescription>
                    输入您的邮箱和密码登录您的账户
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>加载中...</div>}>
                    <FormLogin />
                  </Suspense>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                  <p>登录即表示您同意我们的服务条款和隐私政策</p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>创建账户</CardTitle>
                  <CardDescription>
                    注册一个新账户以使用所有功能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>加载中...</div>}>
                    <FormRegister />
                  </Suspense>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500">
                  <p>注册即表示您同意我们的服务条款和隐私政策</p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </ScaleAnimatedContainer>
      </AnimatedContainer>
    </div>
  );
} 