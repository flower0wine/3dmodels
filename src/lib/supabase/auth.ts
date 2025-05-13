import { supabase } from '@/lib/supabase/client';

/**
 * 用户登录
 */
export async function signInWithPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * 用户注册
 */
export async function signUp(email: string, password: string, redirectTo: string) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
}

/**
 * 登出用户
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * 获取当前会话
 */
export async function getSession() {
  return await supabase.auth.getSession();
}

/**
 * 获取当前用户
 */
export async function getUser() {
  return await supabase.auth.getUser();
}

/**
 * 发送OTP验证码
 */
export async function signInWithOtp(email: string, shouldCreateUser: boolean, redirectTo: string) {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser,
      emailRedirectTo: redirectTo,
    },
  });
}

/**
 * 验证OTP验证码
 */
export async function verifyOtp(email: string, token: string) {
  return await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
}

/**
 * 发送重置密码邮件
 */
export async function resetPasswordForEmail(email: string, redirectTo: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
}

/**
 * 更新用户密码
 */
export async function updatePassword(password: string) {
  return await supabase.auth.updateUser({ password });
}

