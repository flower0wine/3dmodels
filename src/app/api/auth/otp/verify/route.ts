import { verifyOtp, signUp } from '@/lib/supabase/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: "请输入有效的电子邮箱地址" }),
  token: z.string().min(6, { message: "验证码格式不正确" }).max(6),
  password: z.string()
    .min(8, { message: "密码至少需要8个字符" })
    .regex(/[a-z]/, { message: "密码必须包含至少一个小写字母" })
    .regex(/[A-Z]/, { message: "密码必须包含至少一个大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validationResult = verifyOtpSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, token, password } = validationResult.data;
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const redirectTo = `${origin}/auth/callback`;
    
    // 验证OTP
    const { data: otpData, error: otpError } = await verifyOtp(email, token);
    
    if (otpError) {
      return NextResponse.json(
        { error: otpError.message },
        { status: 400 }
      );
    }
    
    // 使用密码注册新用户
    const { data: signUpData, error: signUpError } = await signUp(email, password, redirectTo);
    
    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      user: signUpData.user,
      session: signUpData.session,
      message: "账号注册成功"
    });
    
  } catch (error: unknown) {
    console.error('验证OTP错误:', error);
    return NextResponse.json(
      { error: "验证过程中发生错误" },
      { status: 500 }
    );
  }
} 