-- ============================================================
-- مخطط قاعدة بيانات Supabase لمتجر "شمس سوريا"
-- انسخ هذا الكود كاملاً وألصقه في Supabase SQL Editor
-- ثم انقر Run
-- ============================================================

-- تفعيل امتداد uuid-ossp إذا لم يكن مفعّلاً
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. جدول ملفات المستخدمين (profiles)
-- يُكمّل جدول auth.users الخاص بـ Supabase
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهرس للبحث السريع بالدور
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- ============================================================
-- 2. جدول المنتجات (products)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category        TEXT NOT NULL CHECK (category IN ('panel', 'battery', 'inverter', 'accessory')),
  image_url       TEXT NOT NULL DEFAULT '',
  power_watts     INTEGER CHECK (power_watts > 0),       -- للألواح الشمسية
  capacity_kwh    NUMERIC(6, 2) CHECK (capacity_kwh > 0), -- للبطاريات
  voltage         INTEGER CHECK (voltage > 0),           -- الجهد الكهربائي
  stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهارس للبحث والتصفية
CREATE INDEX IF NOT EXISTS products_category_idx    ON public.products(category);
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS products_price_idx       ON public.products(price);

-- ============================================================
-- 3. جدول الطلبات (orders)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- فهارس
CREATE INDEX IF NOT EXISTS orders_user_id_idx    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);

-- ============================================================
-- 4. جدول عناصر الطلب (order_items)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);

-- ============================================================
-- 5. جدول الحسابات المحفوظة (saved_calculations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_calculations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  input_data   JSONB NOT NULL DEFAULT '{}',
  result_data  JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_calculations_user_id_idx ON public.saved_calculations(user_id);

-- ============================================================
-- 6. دالة لتحديث updated_at تلقائياً
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 6.1. ⭐ دالة إنشاء profile تلقائياً عند تسجيل مستخدم جديد
-- هذه الدالة تحل مشكلة "خطأ في تسجيل الدخول بعد تأكيد البريد"
-- لأنها تعمل بصلاحيات SECURITY DEFINER (تتجاوز RLS)
-- ============================================================
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

-- يطلق الدالة عند إضافة مستخدم جديد في auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. سياسات أمان الصفوف (Row Level Security — RLS)
-- ============================================================

-- --- تفعيل RLS على جميع الجداول ---
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

-- --------- سياسات جدول profiles ---------
-- كل مستخدم يرى ويعدّل ملفه الشخصي فقط
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- الأدمن يرى جميع الملفات
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------- سياسات جدول products ---------
-- الجميع (بما فيهم الزوار) يمكنهم رؤية المنتجات
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (TRUE);

-- الأدمن فقط يستطيع الكتابة
CREATE POLICY "products_admin_write" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------- سياسات جدول orders ---------
-- العميل يرى طلباته فقط
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

-- العميل يُنشئ طلبات باسمه فقط
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- الأدمن يرى ويعدّل جميع الطلبات
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------- سياسات جدول order_items ---------
-- العميل يرى عناصر طلباته فقط
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- العميل يُضيف عناصر لطلباته
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- الأدمن يرى جميع عناصر الطلبات
CREATE POLICY "order_items_admin_all" ON public.order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------- سياسات جدول saved_calculations ---------
-- العميل يرى ويعدّل حساباته فقط
CREATE POLICY "calc_own_all" ON public.saved_calculations
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- 8. بيانات تجريبية (Seed Data) للتطوير والاختبار
-- احذف هذا القسم في بيئة الإنتاج
-- ============================================================

INSERT INTO public.products (name, description, price, category, image_url, power_watts, capacity_kwh, voltage, stock_quantity, is_featured) VALUES
  -- ===== ألواح شمسية =====
  (
    'لوح شمسي Mono 400W',
    'لوح شمسي أحادي البلورة بكفاءة عالية 21%. مناسب للمنازل والمنشآت الصغيرة. ضمان 25 سنة على الأداء.',
    850000, 'panel',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format&fit=crop',
    400, NULL, 24, 50, TRUE
  ),
  (
    'لوح شمسي Mono 550W Half-Cut',
    'أحدث جيل من الألواح بتقنية Half-Cut. كفاءة 22.5% وأداء ممتاز في الإضاءة المنخفضة. للمنشآت الكبيرة.',
    1450000, 'panel',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80&auto=format&fit=crop',
    550, NULL, 36, 35, TRUE
  ),
  (
    'لوح شمسي Poly 300W',
    'لوح شمسي متعدد البلورات اقتصادي الثمن مع كفاءة جيدة. الخيار الأمثل للميزانية المحدودة.',
    650000, 'panel',
    'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800&q=80&auto=format&fit=crop',
    300, NULL, 24, 80, FALSE
  ),
  (
    'لوح شمسي مرن 200W',
    'لوح شمسي قابل للانحناء حتى 30 درجة. مثالي للقوارب والكرفانات والأسطح المنحنية. مقاوم للماء.',
    580000, 'panel',
    'https://images.unsplash.com/photo-1611365892117-bce8a45b561a?w=800&q=80&auto=format&fit=crop',
    200, NULL, 12, 25, FALSE
  ),

  -- ===== بطاريات =====
  (
    'بطارية AGM 200Ah 12V',
    'بطارية متعددة الخلايا عالية التحمل للطاقة الشمسية. لا تحتاج صيانة، مناسبة للمناطق ذات درجات الحرارة العالية.',
    1200000, 'battery',
    'https://images.unsplash.com/photo-1620714223084-8fcacc2dfd8d?w=800&q=80&auto=format&fit=crop',
    NULL, 2.4, 12, 30, TRUE
  ),
  (
    'بطارية ليثيوم LiFePO4 100Ah',
    'بطارية ليثيوم فوسفات الحديد. أطول عمر وأخف وزناً من AGM. دورات شحن تصل 3000 دورة. ضمان 5 سنوات.',
    4200000, 'battery',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80&auto=format&fit=crop',
    NULL, 5.12, 12, 20, TRUE
  ),
  (
    'بطارية Gel 150Ah 12V',
    'بطارية جل عميقة التفريغ، مغلقة بالكامل ولا تحتاج صيانة. ممتازة في درجات الحرارة المرتفعة.',
    980000, 'battery',
    'https://images.unsplash.com/photo-1610056494249-cdf1be4d3a9c?w=800&q=80&auto=format&fit=crop',
    NULL, 1.8, 12, 40, FALSE
  ),
  (
    'بطارية ليثيوم Wall-Mount 10kWh',
    'وحدة تخزين منزلية ضخمة معلّقة على الحائط. أنيقة وذكية مع شاشة BMS. لتغطية منزل كامل لأيام.',
    18500000, 'battery',
    'https://images.unsplash.com/photo-1683009686993-a05a99e4ddbe?w=800&q=80&auto=format&fit=crop',
    NULL, 10.24, 48, 8, TRUE
  ),

  -- ===== إنفرترات =====
  (
    'إنفرتر هجين 5kW',
    'إنفرتر شبكة هجين مع شاحن MPPT مدمج. يدعم شبكة الكهرباء والبطاريات في آن واحد. شاشة LCD عربية.',
    3500000, 'inverter',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
    NULL, NULL, 48, 15, TRUE
  ),
  (
    'إنفرتر Off-Grid 3kW',
    'إنفرتر مستقل عن الشبكة بقدرة 3 كيلو واط. ممتاز للاستخدام المنزلي المتوسط. كفاءة 95%.',
    2100000, 'inverter',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80&auto=format&fit=crop',
    NULL, NULL, 24, 22, FALSE
  ),
  (
    'إنفرتر هجين 8kW ثلاثي الطور',
    'إنفرتر ثلاثي الطور للمنشآت التجارية والصناعية. يتصل بالتطبيق عبر WiFi للمراقبة عن بُعد.',
    6800000, 'inverter',
    'https://images.unsplash.com/photo-1611365892117-00ac5ef1c08c?w=800&q=80&auto=format&fit=crop',
    NULL, NULL, 48, 10, TRUE
  ),

  -- ===== ملحقات وإكسسوارات =====
  (
    'كابل شمسي 6mm² (متر)',
    'كابل شمسي مقاوم للأشعة فوق البنفسجية ودرجات الحرارة العالية. معتمد TÜV. للبيع بالمتر.',
    15000, 'accessory',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80&auto=format&fit=crop',
    NULL, NULL, NULL, 500, FALSE
  ),
  (
    'منظم شحن MPPT 60A',
    'منظم شحن MPPT احترافي يدعم بطاريات 12/24/48 فولت. شاشة LCD مع بلوتوث للمراقبة.',
    780000, 'accessory',
    'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=800&q=80&auto=format&fit=crop',
    NULL, NULL, 48, 18, FALSE
  ),
  (
    'هيكل تثبيت ألواح (طقم 4 ألواح)',
    'هيكل ألمنيوم مقاوم للصدأ لتثبيت الألواح على الأسطح. زاوية قابلة للتعديل من 15° إلى 60°.',
    320000, 'accessory',
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&q=80&auto=format&fit=crop',
    NULL, NULL, NULL, 60, FALSE
  ),
  (
    'صندوق توزيع DC مع قواطع',
    'صندوق حماية للتيار المستمر مع قواطع وصواعق وفيوزات DC. حماية كاملة للمنظومة.',
    250000, 'accessory',
    'https://images.unsplash.com/photo-1601706354445-7c3e0c2c1ed5?w=800&q=80&auto=format&fit=crop',
    NULL, NULL, NULL, 35, FALSE
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. لجعل حساب معين "أدمن" — استبدل البريد الإلكتروني بعد التسجيل
-- ============================================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@shams-syria.com';
