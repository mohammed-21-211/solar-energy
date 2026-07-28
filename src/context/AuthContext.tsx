import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, ORGANIZATION_ID } from '../supabase/client'
import type { UserProfile } from '../types'

// ======================================================
// سياق المصادقة (Authentication Context)
// يوفر بيانات المستخدم وصلاحياته لكل مكونات التطبيق
// ======================================================

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // جلب بيانات الملف الشخصي من View فوق الجدول المشترك public.profiles
  // ودور المستخدم من عضويات المؤسسة (public.organization_members)
  const fetchProfile = async (userId: string) => {
    const [profileRes, membershipRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', ORGANIZATION_ID)
        .maybeSingle(),
    ])

    if (!profileRes.error && profileRes.data) {
      // أدمن المتجر = عضو في المؤسسة بدور owner أو admin
      const orgRole = membershipRes.data?.role
      const role: UserProfile['role'] =
        orgRole === 'owner' || orgRole === 'admin' ? 'admin' : 'customer'
      setProfile({ ...(profileRes.data as Omit<UserProfile, 'role'>), role })
    }
  }

  useEffect(() => {
    // التحقق من الجلسة الحالية عند تحميل التطبيق
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    // ملاحظة: يوجد Trigger على auth.users يُنشئ profile تلقائياً
    // البيانات الإضافية تُمرَّر عبر raw_user_meta_data
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone ?? null },
      },
    })

    if (error) return { error: error.message }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, isAdmin, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook مختصر لاستخدام سياق المصادقة
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth يجب استخدامه داخل AuthProvider')
  return context
}
