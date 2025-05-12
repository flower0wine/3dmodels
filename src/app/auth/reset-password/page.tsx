"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePassword } from "@/api/auth";
import { AnimatedAlert, AnimatedSuccessMessage } from "@/components/ui/animated-alert";
import { AnimatedContainer, AnimatedHeading, AnimatedText, ScaleAnimatedContainer } from "@/components/ui/animated-container";

// 验证Schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "密码至少需要8个字符" })
    .regex(/[a-z]/, { message: "密码必须包含至少一个小写字母" })
    .regex(/[A-Z]/, { message: "密码必须包含至少一个大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
  confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "密码不匹配",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 重置密码表单
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // 处理重置密码提交
  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updatePassword(data.password);
      
      setIsSuccess(true);
      
      // 3秒后重定向到登录页面
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "重置密码失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <AnimatedContainer className="w-full max-w-md space-y-8">
        <div className="text-center">
          <AnimatedHeading
            className="mt-6 text-3xl font-bold tracking-tight text-gray-900"
            delay={0.2}
          >
            重置您的密码
          </AnimatedHeading>
          <AnimatedText
            className="mt-2 text-sm text-gray-600"
            delay={0.3}
          >
            请输入您的新密码
          </AnimatedText>
        </div>

        <ScaleAnimatedContainer delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>设置新密码</CardTitle>
              <CardDescription>
                您的新密码必须与以前使用的密码不同
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <AnimatedSuccessMessage
                  show={true}
                  title="密码重置成功！"
                  description="您的密码已成功更新。正在将您重定向到登录页面..."
                />
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <AnimatedAlert 
                      show={!!error} 
                      variant="destructive"
                    >
                      {error}
                    </AnimatedAlert>

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>新密码</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>确认新密码</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "正在更新..." : "更新密码"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-gray-500">
              <Button
                type="button"
                variant="link"
                className="px-0 font-normal"
                onClick={() => router.push("/auth")}
                disabled={isLoading}
              >
                返回登录
              </Button>
            </CardFooter>
          </Card>
        </ScaleAnimatedContainer>
      </AnimatedContainer>
    </div>
  );
} 