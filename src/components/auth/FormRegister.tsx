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
import { Checkbox } from "@/components/ui/checkbox";
import { register, sendOtpLogin } from "@/api/auth";
import { AnimatedAlert, AnimatedSuccessMessage } from "@/components/ui/animated-alert";

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
  terms: z.boolean().refine(val => val === true, { 
    message: "您必须同意条款和条件才能继续" 
  }),
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
  const [registeredEmail, setRegisteredEmail] = useState("");

  // 注册表单
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // 处理注册提交
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 使用API服务进行注册
      await register(data.email, data.password);
      
      setIsVerificationSent(true);
      setRegisteredEmail(data.email);
    } catch (err: any) {
      setError(err.response?.data?.error || "注册失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理OTP验证码登录
  const handleOtpLogin = async () => {
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
      setRegisteredEmail(email);
    } catch (err: any) {
      setError(err.response?.data?.error || "发送验证码失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerificationSent) {
    return (
      <div className="text-center">
        <AnimatedSuccessMessage
          show={true}
          title="验证邮件已发送"
          description={`我们已向 ${registeredEmail} 发送了一封验证邮件。请查收并点击邮件中的链接以完成注册。`}
        />
        <Button 
          variant="outline" 
          onClick={() => setIsVerificationSent(false)}
          className="mt-2"
        >
          返回注册
        </Button>
      </div>
    );
  }

  return (
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

        <div className="grid gap-4 sm:grid-cols-2">
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>确认密码</FormLabel>
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
        </div>
        
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  我同意服务条款和隐私政策
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="font-normal"
            onClick={handleOtpLogin}
            disabled={isLoading}
          >
            使用邮箱验证码注册
          </Button>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "注册中..." : "注册账户"}
        </Button>
      </form>
    </Form>
  );
} 