# ☀️ شمس سوريا — متجر الطاقة الشمسية

> منصة تجارة إلكترونية متكاملة متخصصة في بيع ألواح الطاقة الشمسية والمعدات المرافقة لها، مصممة خصيصاً للسوق السوري بواجهة عربية كاملة.

---

## 🚀 المميزات التقنية والتجارية

### الواجهة الأمامية (Frontend)
| الميزة | الوصف |
|---|---|
| **Vite + React 18** | بيئة تطوير سريعة جداً مع React الحديثة |
| **TypeScript** | أنواع بيانات صارمة تمنع الأخطاء في وقت التطوير |
| **Tailwind CSS** | تنسيق احترافي بدون inline styles مع ثيم مخصص |
| **واجهة RTL كاملة** | دعم اتجاه اليمين لليسار لكل عناصر الموقع |
| **خطوط عربية** | Tajawal و Cairo من Google Fonts |
| **React Router v6** | تنقل بين الصفحات بدون إعادة تحميل |
| **Context API** | إدارة حالة المصادقة وسلة التسوق |
| **localStorage** | حفظ سلة التسوق بين الجلسات |
| **react-hot-toast** | إشعارات جميلة باللغة العربية |

### الباك إند وقاعدة البيانات (Backend / Database)
| الميزة | الوصف |
|---|---|
| **Supabase Auth** | مصادقة آمنة مع JWT وجلسات تلقائية |
| **PostgreSQL** | قاعدة بيانات علائقية موثوقة |
| **Row Level Security** | حماية البيانات على مستوى الصفوف |
| **Real-time ready** | الهيكلية جاهزة للتحديثات اللحظية |

### ميزات المتجر
- 🛒 **سلة تسوق ذكية** تدعم التحديث والحذف والكميات
- 🔍 **تصفية ديناميكية** حسب الفئة والسعر والبحث
- ⭐ **منتجات مميزة** تظهر في الصفحة الرئيسية
- 📦 **تتبع الطلبات** من "قيد المراجعة" حتى "تم التسليم"

### حاسبة الطاقة الشمسية ⚡
- إضافة أجهزة مخصصة أو اختيار من قائمة الأجهزة الشائعة
- ضبط ساعات الشمس اليومية وأيام الاستقلالية
- حساب: عدد الألواح، سعة البطاريات، حجم الإنفرتر
- حفظ الحسابات في حساب المستخدم للرجوع إليها

---

## 🗂️ هيكلية المشروع

```
src/
├── components/        # مكونات قابلة لإعادة الاستخدام
│   ├── Layout.tsx         # التخطيط العام (Navbar + Footer + Outlet)
│   ├── Navbar.tsx         # شريط التنقل مع دعم الجوال
│   ├── Footer.tsx         # تذييل الصفحة
│   ├── ProductCard.tsx    # بطاقة عرض المنتج
│   ├── Loader.tsx         # مكوّن التحميل
│   └── ProtectedRoute.tsx # حماية المسارات بالصلاحيات
│
├── pages/             # صفحات الموقع
│   ├── Home.tsx           # الصفحة الرئيسية
│   ├── Shop.tsx           # صفحة المتجر مع الفلاتر
│   ├── Calculator.tsx     # حاسبة الطاقة الشمسية
│   ├── Cart.tsx           # سلة التسوق وإتمام الطلب
│   ├── Login.tsx          # صفحة تسجيل الدخول
│   ├── Register.tsx       # صفحة إنشاء حساب
│   ├── CustomerDashboard.tsx # لوحة تحكم العميل
│   ├── AdminDashboard.tsx    # لوحة تحكم الأدمن
│   └── NotFound.tsx       # صفحة 404
│
├── context/           # مزودو الحالة العامة
│   ├── AuthContext.tsx    # حالة المصادقة والمستخدم
│   └── CartContext.tsx    # حالة سلة التسوق
│
├── hooks/             # Custom Hooks
│   ├── useProducts.ts     # جلب وإدارة المنتجات
│   ├── useOrders.ts       # جلب وإدارة الطلبات
│   ├── useSolarCalculator.ts # منطق الحاسبة الشمسية
│   └── useDashboardStats.ts  # إحصائيات لوحة الأدمن
│
├── supabase/          # ملفات Supabase
│   ├── client.ts          # إنشاء عميل Supabase
│   └── database.types.ts  # أنواع TypeScript لقاعدة البيانات
│
├── types/
│   └── index.ts           # جميع أنواع TypeScript للمشروع
│
├── App.tsx            # المكوّن الجذر مع Router
├── main.tsx           # نقطة الدخول
└── index.css          # الأنماط العامة مع Tailwind
```

---

## ⚙️ طريقة التشغيل خطوة بخطوة

### 1. المتطلبات الأساسية
```bash
Node.js >= 18
npm >= 9
```

### 2. استنساخ المشروع وتثبيت المكتبات
```bash
git clone <رابط-المستودع>
cd solar-energy
npm install
```

### 3. إعداد Supabase (قاعدة بيانات Multi-Tenant)

المشروع يعمل الآن داخل قاعدة بيانات Multi-Tenant موجودة مسبقاً تحتوي الجداول المشتركة
(`public.profiles` و`public.organizations` و`public.organization_members` و`public.projects`).
جميع جداول المشروع تعيش في schema خاصة باسم **`solar_energy_syria`**.

1. افتح **SQL Editor** في مشروع الـ Multi-Tenant ونفّذ ملفات الترحيل بالترتيب:
   - `supabase/migrations/20260711000001_solar_energy_syria_schema.sql`
   - `supabase/migrations/20260711000002_solar_energy_syria_rls.sql`
2. اذهب إلى **Settings → API → Data API → Exposed schemas** وأضف `solar_energy_syria`
3. من إعدادات المشروع → **API** انسخ:
   - `Project URL`
   - `anon (public) key`

> ⚠️ ملف `supabase/schema.sql` القديم خاص بالإعداد المستقل (Single-Tenant) — **لا تنفّذه** على قاعدة الـ Multi-Tenant.

### 4. إعداد متغيرات البيئة
```bash
cp .env.example .env
```
ثم افتح `.env` وضع قيمك:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
# معرّف مؤسستك من جدول public.organizations
VITE_ORGANIZATION_ID=YOUR_ORGANIZATION_UUID
```

### 5. تشغيل المشروع
```bash
npm run dev
```
افتح المتصفح على: **http://localhost:5173**

### 6. إعداد المصادقة في Supabase

اذهب إلى **Supabase Dashboard → Authentication → Providers → Email** وتحقق من:

#### الخيار أ: إيقاف تأكيد البريد (مناسب للتطوير) ✅ موصى به أثناء التجربة
- اذهب إلى **Authentication → Sign In / Up**
- ابحث عن **"Confirm email"** ← اجعله **OFF**
- احفظ التغييرات
- الآن المستخدم يدخل مباشرة بعد التسجيل بدون رابط تأكيد

#### الخيار ب: إبقاء تأكيد البريد (للإنتاج)
- أبقِ **"Confirm email"** مفعّلاً
- بعد التسجيل، افتح إيميلك وانقر رابط التأكيد
- **ثم** سجّل الدخول

> 💡 **مهم:** إنشاء سجل `profiles` عند التسجيل مسؤولية البنية المشتركة لقاعدة الـ Multi-Tenant (Trigger موجود مسبقاً هناك).

### 7. إنشاء حساب أدمن

صلاحية الأدمن مشتقة من عضوية المؤسسة: أي مستخدم عضو في مؤسستك بدور `owner` أو `admin`
في جدول `public.organization_members` يُعامل كأدمن للمتجر.

بعد تسجيل أول حساب عبر الموقع، اذهب إلى **Supabase Dashboard → SQL Editor** وألصق:

```sql
-- استبدل البريد بالبريد الذي سجّلت به، والـ UUID بمعرّف مؤسستك
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT 'YOUR_ORGANIZATION_UUID', p.id, 'admin'
FROM public.profiles p
WHERE p.email = 'بريدك@هنا.com';
```

ثم انقر **Run**. **سجّل خروج وادخل من جديد** لتفعيل الصلاحيات الجديدة. ستجد رابط "لوحة التحكم" يظهر في القائمة العلوية، أو ادخل مباشرة على `/admin`.

> 📍 **مكان تنفيذ هذا الأمر:** Supabase Dashboard → القائمة الجانبية → SQL Editor → + New Query → الصق الأمر → Run.

---

## 🗄️ هيكل قاعدة البيانات

### جدول `profiles`
| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID | مرتبط بـ auth.users |
| `email` | TEXT | البريد الإلكتروني (فريد) |
| `full_name` | TEXT | الاسم الكامل |
| `phone` | TEXT | رقم الهاتف (اختياري) |
| `role` | TEXT | `admin` أو `customer` |

### جدول `products`
| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID | معرّف فريد |
| `name` | TEXT | اسم المنتج |
| `price` | NUMERIC | السعر بالليرة السورية |
| `category` | TEXT | `panel`، `battery`، `inverter`، `accessory` |
| `power_watts` | INTEGER | القدرة بالواط (للألواح) |
| `capacity_kwh` | NUMERIC | السعة بـ kWh (للبطاريات) |
| `stock_quantity` | INTEGER | الكمية المتاحة |
| `is_featured` | BOOLEAN | يظهر في الصفحة الرئيسية |

### جدول `orders`
| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID | معرّف الطلب |
| `user_id` | UUID | مرتبط بالمستخدم |
| `status` | TEXT | `pending` ← `confirmed` ← `shipped` ← `delivered` |
| `total_amount` | NUMERIC | الإجمالي بالليرة السورية |

### جدول `order_items`
| العمود | النوع | الوصف |
|---|---|---|
| `order_id` | UUID | مرتبط بجدول orders |
| `product_id` | UUID | مرتبط بجدول products |
| `quantity` | INTEGER | الكمية |
| `unit_price` | NUMERIC | السعر وقت الطلب |

### جدول `saved_calculations`
| العمود | النوع | الوصف |
|---|---|---|
| `user_id` | UUID | مرتبط بالمستخدم |
| `name` | TEXT | اسم الحساب المحفوظ |
| `input_data` | JSONB | مدخلات الحاسبة |
| `result_data` | JSONB | نتائج الحاسبة |

---

## 🔒 سياسات الأمان (RLS)

| الجدول | الزوار | العملاء | الأدمن |
|---|---|---|---|
| `products` | قراءة ✅ | قراءة ✅ | كامل ✅ |
| `profiles` | — | ملفه فقط ✅ | الكل ✅ |
| `orders` | — | طلباته فقط ✅ | الكل ✅ |
| `saved_calculations` | — | حساباته فقط ✅ | — |

---

## 📦 بناء النسخة النهائية

```bash
npm run build
```
الملفات النهائية ستكون في مجلد `dist/` جاهزة للرفع على أي استضافة.

---

**صُنع بـ ❤️ لسوريا — الطاقة الشمسية للجميع ☀️**
