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
import { sendOtpLogin } from "@/api/auth";
import { AnimatedAlert, AnimatedSuccessMessage } from "@/components/ui/motion";
import { ButtonLoadingSpinner } from "@/components/ui/loading";
import axiosInstance from "@/api/axios";
import { useUserStore } from "@/store/userStore";

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
  
  // 使用用户 store
  const login = useUserStore(state => state.login);

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
      await sendOtpLogin(email, true);
      
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
      setError(err.response?.data?.error || "发送验证码失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册提交
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 直接调用验证OTP接口，同时传递密码进行注册
      const response = await axiosInstance.post("/auth/otp/verify", { 
        email: data.email, 
        token: data.verificationCode,
        password: data.password
      });
      
      // 检查响应数据中是否包含user和session信息
      if (!response.data?.user || !response.data?.session) {
        setError("注册失败，无法创建用户账号");
        return;
      }
      
      // 保存用户信息到 store
      login(response.data.user, response.data.session);
      
      setIsVerificationSuccess(true);
      
      // 注册成功后自动跳转到首页
      setTimeout(() => {
        router.refresh();
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "注册失败，请稍后再试");
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