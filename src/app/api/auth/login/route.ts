import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signInWithPassword } from '@/lib/supabase/auth';

// 验证模式
export const loginSchema = z.object({
  email: z.string().email({ message: "请输入有效的电子邮箱地址" }),
  password: z.string().min(6, { message: "密码至少需要6个字符" }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    
    // 进行登录
    const { data, error } = await signInWithPassword(email, password);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      user: data.user,
      session: data.session
    });
    
  } catch (error: unknown) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: "登录过程中发生错误" },
      { status: 500 }
    );
  }
} 