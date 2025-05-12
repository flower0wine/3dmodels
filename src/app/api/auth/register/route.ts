import { signUp } from '@/lib/supabase/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: "请输入有效的电子邮箱地址" }),
  password: z
    .string()
    .min(8, { message: "密码至少需要8个字符" })
    .regex(/[a-z]/, { message: "密码必须包含至少一个小写字母" })
    .regex(/[A-Z]/, { message: "密码必须包含至少一个大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const redirectTo = `${origin}/auth/callback`;
    
    // 进行注册
    const { data, error } = await signUp(email, password, redirectTo);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      user: data.user,
      message: "验证邮件已发送到您的邮箱"
    });
    
  } catch (error: unknown) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: "注册过程中发生错误" },
      { status: 500 }
    );
  }
} 