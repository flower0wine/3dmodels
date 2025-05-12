import { signInWithOtp } from '@/lib/supabase/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const otpSchema = z.object({
  email: z.string().email({ message: "请输入有效的电子邮箱地址" }),
  shouldCreateUser: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validationResult = otpSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, shouldCreateUser } = validationResult.data;
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const redirectTo = `${origin}/auth/callback`;
    
    // 发送OTP验证码
    const { error } = await signInWithOtp(email, shouldCreateUser, redirectTo);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: "验证码已发送到您的邮箱"
    });
    
  } catch (error: unknown) {
    console.error('发送OTP验证码错误:', error);
    return NextResponse.json(
      { error: "发送验证码过程中发生错误" },
      { status: 500 }
    );
  }
} 