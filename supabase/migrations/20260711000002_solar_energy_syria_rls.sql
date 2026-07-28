-- ============================================================
-- Migration 2: صلاحيات وسياسات RLS على أساس organization_id
-- لجداول schema المشروع solar_energy_syria
-- ============================================================

-- ------------------------------------------------------------
-- 1) تفعيل RLS
-- ------------------------------------------------------------
ALTER TABLE solar_energy_syria.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_energy_syria.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_energy_syria.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_energy_syria.saved_calculations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2) حذف السياسات القديمة (تنتقل مع الجداول عند SET SCHEMA)
--    التي كانت تعتمد على public.profiles.role
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "products_public_read"    ON solar_energy_syria.products;
DROP POLICY IF EXISTS "products_admin_write"    ON solar_energy_syria.products;
DROP POLICY IF EXISTS "products_admin_insert"   ON solar_energy_syria.products;
DROP POLICY IF EXISTS "products_admin_update"   ON solar_energy_syria.products;
DROP POLICY IF EXISTS "products_admin_delete"   ON solar_energy_syria.products;

DROP POLICY IF EXISTS "orders_select_own"       ON solar_energy_syria.orders;
DROP POLICY IF EXISTS "orders_insert_own"       ON solar_energy_syria.orders;
DROP POLICY IF EXISTS "orders_admin_all"        ON solar_energy_syria.orders;

DROP POLICY IF EXISTS "order_items_select_own"  ON solar_energy_syria.order_items;
DROP POLICY IF EXISTS "order_items_insert_own"  ON solar_energy_syria.order_items;
DROP POLICY IF EXISTS "order_items_admin_all"   ON solar_energy_syria.order_items;

DROP POLICY IF EXISTS "calc_own_all"            ON solar_energy_syria.saved_calculations;

-- ------------------------------------------------------------
-- 3) سياسات المنتجات
-- ------------------------------------------------------------
-- كتالوج عام: الجميع (بمن فيهم الزوار) يقرؤون المنتجات
-- والتطبيق يُصفّي حسب organization_id
CREATE POLICY "products_public_read" ON solar_energy_syria.products
  FOR SELECT USING (TRUE);

-- الكتابة لأدمن المؤسسة المالكة فقط
CREATE POLICY "products_org_admin_insert" ON solar_energy_syria.products
  FOR INSERT WITH CHECK (solar_energy_syria.is_org_admin(organization_id));

CREATE POLICY "products_org_admin_update" ON solar_energy_syria.products
  FOR UPDATE USING (solar_energy_syria.is_org_admin(organization_id))
  WITH CHECK (solar_energy_syria.is_org_admin(organization_id));

CREATE POLICY "products_org_admin_delete" ON solar_energy_syria.products
  FOR DELETE USING (solar_energy_syria.is_org_admin(organization_id));

-- ------------------------------------------------------------
-- 4) سياسات الطلبات
-- ------------------------------------------------------------
-- العميل يرى طلباته فقط
CREATE POLICY "orders_select_own" ON solar_energy_syria.orders
  FOR SELECT USING (user_id = auth.uid());

-- العميل يُنشئ طلبات باسمه فقط
CREATE POLICY "orders_insert_own" ON solar_energy_syria.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- أدمن المؤسسة يرى ويعدّل طلبات مؤسسته فقط
CREATE POLICY "orders_org_admin_all" ON solar_energy_syria.orders
  FOR ALL USING (solar_energy_syria.is_org_admin(organization_id))
  WITH CHECK (solar_energy_syria.is_org_admin(organization_id));

-- ------------------------------------------------------------
-- 5) سياسات عناصر الطلب
-- ------------------------------------------------------------
CREATE POLICY "order_items_select_own" ON solar_energy_syria.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM solar_energy_syria.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_own" ON solar_energy_syria.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM solar_energy_syria.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_org_admin_all" ON solar_energy_syria.order_items
  FOR ALL USING (solar_energy_syria.is_org_admin(organization_id))
  WITH CHECK (solar_energy_syria.is_org_admin(organization_id));

-- ------------------------------------------------------------
-- 6) سياسات الحسابات المحفوظة
-- ------------------------------------------------------------
CREATE POLICY "calc_own_all" ON solar_energy_syria.saved_calculations
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------
-- 7) صلاحيات الوصول للـ schema عبر PostgREST (Supabase API)
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA solar_energy_syria TO anon, authenticated, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA solar_energy_syria TO anon;
GRANT ALL    ON ALL TABLES IN SCHEMA solar_energy_syria TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA solar_energy_syria TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA solar_energy_syria
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA solar_energy_syria
  GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA solar_energy_syria
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- ⚠️ خطوة يدوية إضافية مطلوبة:
-- أضف "solar_energy_syria" إلى Exposed Schemas في
-- Supabase Dashboard → Settings → API → Data API → Exposed schemas
