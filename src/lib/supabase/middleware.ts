"use server"

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 创建空的响应对象
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // 刷新会话，检查当前用户
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // 如果有错误，记录错误但继续
    if (error) {
      console.error('Auth session refresh error:', error.message);
    }
    
    // 针对特定路径检查身份验证
    // 如果路径以/admin或/dashboard开头且用户未登录，可以重定向到登录页面
    // 注意：取消下面的注释并根据你的项目需求调整路径
    /*
    const path = request.nextUrl.pathname;
    if ((path.startsWith('/admin') || path.startsWith('/dashboard')) && !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    */
    
  } catch (e) {
    console.error('Unexpected error during session refresh:', e);
  }

  return supabaseResponse;
}
