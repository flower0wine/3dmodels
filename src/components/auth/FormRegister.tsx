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
import { AnimatedAlert, AnimatedSuccessMessage } from "@/components/ui/motion";
import { ButtonLoadingSpinner } from "@/components/ui/loading";
import { signInWithOtp, verifyOtp, signUp } from "@/lib/supabase/auth";
import { toast } from "sonner";

// 验证Schema
const registerSchema = z.object({
  email: z.string().email({ message: "请输入有效的电子邮箱地址" }),
  password: z
    .string()
    .min(8, { message: "密码至少需要8个字符" })
    .regex(/[a-z]/, { message: "密码必须包含至少一个小写字母" })
    .regex(/[A-Z]/, { message: "密码必须包含至少一个大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
  confirmPassword: z.string(),
  verificationCode: z.string().min(6, { message: "请输入6位验证码" }).max(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "密码不匹配",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function FormRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // 注册表单
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
    },
  });

  // 处理发送验证码
  const handleSendVerificationCode = async () => {
    const email = form.getValues("email");

    if (!email || !z.string().email().safeParse(email).success) {
      form.setError("email", { message: "请先输入有效的电子邮箱" });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 使用 Supabase auth API 发送 OTP
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await signInWithOtp(email, true, redirectTo);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setIsVerificationSent(true);
      // 设置倒计时60秒
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "发送验证码失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册提交
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 首先验证OTP验证码
      const { data: otpData, error: otpError } = await verifyOtp(
        data.email,
        data.verificationCode
      );
      
      if (otpError) {
        throw new Error(otpError.message);
      }
      
      if (!otpData?.user) {
        throw new Error("验证码验证失败");
      }
      
      // 如果验证码验证成功，创建新用户账号
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: signUpError } = await signUp(
        data.email,
        data.password,
        redirectTo
      );
      
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      
      setIsVerificationSuccess(true);

      toast.success("注册成功");
      
      // 注册成功后自动跳转到首页
      setTimeout(() => {
        router.refresh();
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "注册失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerificationSuccess) {
    return (
      <div className="text-center">
        <AnimatedSuccessMessage
          show={true}
          title="注册成功！"
          description="您已成功注册并验证邮箱，正在为您跳转到首页..."
        />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AnimatedAlert show={!!error} variant="destructive">
          {error}
        </AnimatedAlert>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>电子邮箱</FormLabel>
              <FormControl>
                <div className="flex space-x-2">
                  <Input
                    placeholder="your@email.com"
                    {...field}
                    disabled={isLoading || isVerificationSent}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSendVerificationCode}
                    disabled={isLoading || countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}秒后重试` : (isVerificationSent ? "重新发送" : "发送验证码")}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verificationCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>验证码</FormLabel>
              <FormControl>
                <Input
                  placeholder="输入6位验证码"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="请输入密码"
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
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="请输入确认密码"
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
          disabled={isLoading || !isVerificationSent}
        >
          {isLoading ? (
            <>
              <ButtonLoadingSpinner className="mr-2" />
              注册中...
            </>
          ) : (
            "注册账户"
          )}
        </Button>
      </form>
    </Form>
  );
} 