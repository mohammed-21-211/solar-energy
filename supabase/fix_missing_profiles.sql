-- ============================================================
-- إصلاح: إنشاء profiles مفقودة لجميع مستخدمي auth.users
-- وإعادة تثبيت الـ trigger ليعمل لكل مستخدم جديد
-- انسخ الكود كاملاً والصقه في Supabase SQL Editor ثم Run
-- ============================================================

-- 1) ملء profiles لكل مستخدم في auth.users لا يملك profile حالياً
INSERT INTO public.profiles (id, email, full_name, phone, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'phone',
  'customer'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 2) التأكد من سلامة الـ trigger الذي يُنشئ profile تلقائياً
--    عند تسجيل أي مستخدم جديد في المستقبل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) تحقّق من النتيجة: يجب أن يتساوى عدد المستخدمين مع عدد profiles
SELECT
  (SELECT COUNT(*) FROM auth.users)        AS total_auth_users,
  (SELECT COUNT(*) FROM public.profiles)   AS total_profiles;

-- 4) عرض جميع profiles لمعرفة من هو الأدمن ومن هو الزبون
SELECT email, role, created_at
FROM public.profiles
ORDER BY created_at DESC;
