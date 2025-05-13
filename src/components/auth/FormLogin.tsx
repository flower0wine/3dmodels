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
import { login as apiLogin, resetPasswordRequest } from "@/api/auth";
import { AnimatedAlert, AnimatedSuccessMessage } from "@/components/ui/motion";
import { ButtonLoadingSpinner } from "@/components/ui/loading";
import { useUserStore } from "@/store/userStore";

// 验证Schema
const loginSchema = z.object({
  email: z.string().email({ message: "请输入有效的电子邮箱地址" }),
  password: z.string().min(6, { message: "密码至少需要6个字符" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function FormLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  
  // 使用用户 store
  const storeLogin = useUserStore(state => state.login);

  // 登录表单
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 处理登录提交
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiLogin(data.email, data.password);
      
      // 检查响应数据中是否包含user和session信息
      if (!response.user || !response.session) {
        setError("登录失败，服务器返回的数据无效");
        return;
      }
      
      // 保存用户信息到 store
      storeLogin(response.user, response.session);
      
      router.refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "登录失败，请检查您的凭据");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理重置密码
  const handlePasswordReset = async () => {
    const email = form.getValues("email");

    if (!email || !z.string().email().safeParse(email).success) {
      form.setError("email", { message: "请先输入有效的电子邮箱" });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPasswordRequest(email);
      setIsMagicLinkSent(true);
      setResetEmail(email);
    } catch (err: any) {
      setError(err.response?.data?.error || "发送重置密码链接失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  if (isMagicLinkSent) {
    return (
      <div className="text-center">
        <AnimatedSuccessMessage
          show={true}
          title="邮件已发送！"
          description={`我们已向 ${resetEmail} 发送了一封包含重置密码链接的电子邮件。`}
        />
        <Button
          variant="outline"
          onClick={() => setIsMagicLinkSent(false)}
          className="mt-2"
        >
          返回登录
        </Button>
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
                <Input
                  placeholder="your@email.com"
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
          type="button"
          variant="link"
          size="sm"
          className="px-0 font-normal"
          onClick={handlePasswordReset}
          disabled={isLoading}
        >
          忘记密码?
        </Button>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <ButtonLoadingSpinner className="mr-2" />
              登录中...
            </>
          ) : (
            "登录"
          )}
        </Button>
      </form>
    </Form>
  );
} 