-- ============================================================
-- إصلاح مشكلة infinite recursion في سياسات RLS
-- انسخ كامل هذا الكود والصقه في Supabase SQL Editor ثم Run
-- ============================================================

-- 1) حذف السياسات الإشكالية
DROP POLICY IF EXISTS "profiles_admin_all"     ON public.profiles;
DROP POLICY IF EXISTS "products_admin_write"   ON public.products;
DROP POLICY IF EXISTS "orders_admin_all"       ON public.orders;
DROP POLICY IF EXISTS "order_items_admin_all"  ON public.order_items;

-- 2) إنشاء دالة مساعدة بصلاحيات SECURITY DEFINER تتجاوز RLS
--    وبهذا لا تستدعي السياسة نفسها عند فحص الدور
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 3) إعادة إنشاء السياسات باستخدام الدالة بدلاً من الاستعلام المباشر
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- ملاحظة: نفصل products_admin_write لتشمل فقط الكتابة (وليس FOR ALL)
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (public.is_admin());

CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 4) تأكيد البريد للحساب يدوياً (للتطوير فقط)
-- ============================================================
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'mh603289@gmail.com';

-- ============================================================
-- 5) إنشاء profile للحساب وجعله أدمن في خطوة واحدة
-- ============================================================
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
  'admin'
FROM auth.users
WHERE email = 'mh603289@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================================
-- 6) تحقّق من النتيجة
-- ============================================================
SELECT id, email, role, created_at
FROM public.profiles
WHERE email = 'mh603289@gmail.com';
