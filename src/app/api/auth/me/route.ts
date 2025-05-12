import { getSession, getUser } from '@/lib/supabase/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 获取当前用户会话
    const { data: { session }, error } = await getSession();
    
    if (error || !session) {
      return NextResponse.json(
        { error: error?.message || "未授权" },
        { status: 401 }
      );
    }
    
    // 获取用户详情
    const { data: { user }, error: userError } = await getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || "未找到用户" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      user,
      session
    });
    
  } catch (error: unknown) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: "获取用户信息过程中发生错误" },
      { status: 500 }
    );
  }
} 