import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// قراءة متغيرات البيئة من ملف .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// معرّف المؤسسة في قاعدة البيانات Multi-Tenant (public.organizations.id)
export const ORGANIZATION_ID = import.meta.env.VITE_ORGANIZATION_ID as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('يرجى إعداد متغيرات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env')
}

if (!ORGANIZATION_ID) {
  throw new Error('يرجى إعداد متغير VITE_ORGANIZATION_ID في ملف .env (معرّف المؤسسة في public.organizations)')
}

// إنشاء عميل Supabase الموحد لاستخدامه في كل المشروع
// جميع جداول المشروع تعيش في schema خاصة بالمشروع (solar_energy_syria)
// بينما تبقى الجداول المشتركة (profiles, organizations, ...) في public
// ويتم الوصول إليها عبر Views داخل نفس الـ schema
export const supabase = createClient<Database, 'solar_energy_syria'>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'solar_energy_syria',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
