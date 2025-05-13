import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  
  // 设置用户信息
  setUser: (user: User | null) => void;
  // 设置会话信息
  setSession: (session: Session | null) => void;
  // 登录（设置用户和会话）
  login: (user: User, session: Session) => void;
  // 登出
  logout: () => void;
}

// 创建持久化的用户状态
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      
      setUser: (user) => set(() => ({ 
        user,
        isAuthenticated: !!user
      })),
      
      setSession: (session) => set(() => ({ session })),
      
      login: (user, session) => set(() => ({
        user,
        session,
        isAuthenticated: true
      })),
      
      logout: () => set(() => ({
        user: null,
        session: null,
        isAuthenticated: false
      }))
    }),
    {
      name: 'user-storage',
      // 只持久化这些字段
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 