import { signOut } from '@/lib/supabase/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 执行登出操作
    await signOut();
    
    return NextResponse.json({ 
      message: "成功退出登录"
    });
    
  } catch (error: unknown) {
    console.error('登出错误:', error);
    return NextResponse.json(
      { error: "登出过程中发生错误" },
      { status: 500 }
    );
  }
} 