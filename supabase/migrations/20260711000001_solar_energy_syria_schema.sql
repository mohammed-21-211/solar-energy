-- ============================================================
-- Migration 1: إنشاء schema المشروع "solar_energy_syria"
-- ونقل جداول المشروع إليها مع دعم Multi-Tenant (organization_id)
--
-- لا يُنشئ ولا يُعدّل الجداول المشتركة في public:
--   profiles / organizations / organization_members / projects
-- ============================================================

CREATE SCHEMA IF NOT EXISTS solar_energy_syria;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1) نقل جداول المشروع من public إن وُجدت (سيناريو نفس القاعدة)
--    أو إنشاؤها من الصفر (سيناريو القاعدة الجديدة)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.products') IS NOT NULL THEN
    ALTER TABLE public.products SET SCHEMA solar_energy_syria;
  END IF;
  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE public.orders SET SCHEMA solar_energy_syria;
  END IF;
  IF to_regclass('public.order_items') IS NOT NULL THEN
    ALTER TABLE public.order_items SET SCHEMA solar_energy_syria;
  END IF;
  IF to_regclass('public.saved_calculations') IS NOT NULL THEN
    ALTER TABLE public.saved_calculations SET SCHEMA solar_energy_syria;
  END IF;
END $$;

-- --------- المنتجات ---------
CREATE TABLE IF NOT EXISTS solar_energy_syria.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category        TEXT NOT NULL CHECK (category IN ('panel', 'battery', 'inverter', 'accessory')),
  image_url       TEXT NOT NULL DEFAULT '',
  power_watts     INTEGER CHECK (power_watts > 0),
  capacity_kwh    NUMERIC(6, 2) CHECK (capacity_kwh > 0),
  voltage         INTEGER CHECK (voltage > 0),
  stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------- الطلبات ---------
CREATE TABLE IF NOT EXISTS solar_energy_syria.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount     NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address TEXT NOT NULL,
  phone            TEXT NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------- عناصر الطلب ---------
CREATE TABLE IF NOT EXISTS solar_energy_syria.order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES solar_energy_syria.orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES solar_energy_syria.products(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);

-- --------- الحسابات المحفوظة ---------
CREATE TABLE IF NOT EXISTS solar_energy_syria.saved_calculations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  input_data      JSONB NOT NULL DEFAULT '{}',
  result_data     JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2) إضافة organization_id للجداول المنقولة إن لم يكن موجوداً
--    (يُضاف NULLABLE هنا — بعد تعبئة البيانات نفّذ SET NOT NULL،
--    انظر التقرير النهائي)
-- ------------------------------------------------------------
ALTER TABLE solar_energy_syria.products
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE solar_energy_syria.orders
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE solar_energy_syria.order_items
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE solar_energy_syria.saved_calculations
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- 3) الفهارس
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS products_category_idx        ON solar_energy_syria.products(category);
CREATE INDEX IF NOT EXISTS products_is_featured_idx     ON solar_energy_syria.products(is_featured);
CREATE INDEX IF NOT EXISTS products_price_idx           ON solar_energy_syria.products(price);
CREATE INDEX IF NOT EXISTS products_org_idx             ON solar_energy_syria.products(organization_id);

CREATE INDEX IF NOT EXISTS orders_user_id_idx           ON solar_energy_syria.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx            ON solar_energy_syria.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx        ON solar_energy_syria.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_org_idx               ON solar_energy_syria.orders(organization_id);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx     ON solar_energy_syria.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_org_idx          ON solar_energy_syria.order_items(organization_id);

CREATE INDEX IF NOT EXISTS saved_calculations_user_id_idx ON solar_energy_syria.saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS saved_calculations_org_idx     ON solar_energy_syria.saved_calculations(organization_id);

-- ------------------------------------------------------------
-- 4) Views للقراءة من الجداول المشتركة عبر الـ schema الجديدة
--    (security_invoker = تُطبَّق سياسات RLS الخاصة بالجدول الأصلي
--    على المستخدم المستعلم، ولا نتجاوز أمان الجداول المشتركة)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW solar_energy_syria.profiles
  WITH (security_invoker = true) AS
  SELECT id, email, full_name, phone, created_at
  FROM public.profiles;

CREATE OR REPLACE VIEW solar_energy_syria.memberships
  WITH (security_invoker = true) AS
  SELECT organization_id, user_id, role
  FROM public.organization_members;

-- ------------------------------------------------------------
-- 5) الدوال والـ Triggers الخاصة بالمشروع (داخل schema المشروع)
-- ------------------------------------------------------------

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION solar_energy_syria.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON solar_energy_syria.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON solar_energy_syria.orders
  FOR EACH ROW EXECUTE FUNCTION solar_energy_syria.handle_updated_at();

-- فحص صلاحية "أدمن المؤسسة" اعتماداً على العضويات المشتركة
-- SECURITY DEFINER لتجاوز RLS على organization_members داخل الفحص فقط
CREATE OR REPLACE FUNCTION solar_energy_syria.is_org_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members m
    WHERE m.organization_id = org_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
  );
$$;

-- ملاحظة: لا نُنشئ trigger على auth.users لإنشاء profiles —
-- إنشاء الـ profiles مسؤولية البنية المشتركة للقاعدة Multi-Tenant.
