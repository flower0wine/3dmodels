import { supabase } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 发送重置密码邮件的Schema
const resetRequestSchema = z.object({
  email: z.string().email({ message: "请输入有效的电子邮箱地址" }),
});

// 重置密码的Schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "密码至少需要8个字符" })
    .regex(/[a-z]/, { message: "密码必须包含至少一个小写字母" })
    .regex(/[A-Z]/, { message: "密码必须包含至少一个大写字母" })
    .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
});

// 发送重置密码邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validationResult = resetRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email } = validationResult.data;
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    
    // 发送重置密码邮件
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: "重置密码邮件已发送到您的邮箱"
    });
    
  } catch (error: any) {
    console.error('发送重置密码邮件错误:', error);
    return NextResponse.json(
      { error: "发送重置密码邮件过程中发生错误" },
      { status: 500 }
    );
  }
}

// 更新密码
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { password } = validationResult.data;
    
    // 更新密码
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      message: "密码已成功更新"
    });
    
  } catch (error: any) {
    console.error('重置密码错误:', error);
    return NextResponse.json(
      { error: "重置密码过程中发生错误" },
      { status: 500 }
    );
  }
} 