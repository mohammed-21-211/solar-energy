import { Link } from 'react-router-dom'
import { useFeaturedProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import sun2 from '../assets/sun-2.jpeg'
// ======================================================
// الصفحة الرئيسية — تصميم تحريري دافئ (Warm Editorial)
// ======================================================

export default function Home() {
  const { products, isLoading } = useFeaturedProducts()

  return (
    <div className="animate-fade-in">

      {/* ============================================ */}
      {/* البطل (Hero) — افتتاحية تحريرية              */}
      {/* ============================================ */}
      <section className="relative bg-paper-warm overflow-hidden">
        <div className="container-app px-5 sm:px-8 lg:px-12 pt-16 lg:pt-24 pb-20 lg:pb-32">

          {/* شريط علوي تحريري */}
          <div className="flex items-center gap-4 mb-12 text-xs uppercase tracking-widest text-sand-500">
            <span className="h-px w-12 bg-sand-300" />
            <span>شمس سوريا</span>
            <span className="h-px flex-1 bg-sand-300" />
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">

            {/* العنوان الكبير */}
            <div className="lg:col-span-7">
              <p className="eyebrow mb-6">— ملف خاص · الطاقة الشمسية في سوريا</p>

              <h1 className="display-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-ink mb-8">
                طاقة الشمس،
                <br />
                <span className="text-sun-500">حِرفة</span> سوريّة
                <br />
                <span className="italic text-sand-600">للمستقبل.</span>
              </h1>

              <p className="text-lg text-sand-600 leading-relaxed max-w-xl mb-10">
                نختار لك ألواحاً وبطاريات وإنفرترات بعناية الصائغ —
                لتنال استقلاليّة كهربائية حقيقية لمنزلك أو منشأتك،
                على مدار العام.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/shop" className="btn-primary text-base px-8 py-3.5">
                  تصفّح المتجر
                </Link>
                <Link to="/calculator" className="btn-secondary text-base px-8 py-3.5">
                  احسب منظومتك
                </Link>
              </div>
            </div>

            {/* الصورة + البطاقات الجانبية */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-sand-200">
                  <img
                    src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&q=80&auto=format&fit=crop"
                    alt="ألواح طاقة شمسية"
                    className="w-full h-full object-cover"
                  />
                  {/* علامة تحريرية على الصورة */}
                  <div className="absolute bottom-4 right-4 bg-ivory/95 backdrop-blur px-3 py-1.5 rounded">
                    <p className="text-[10px] uppercase tracking-widest text-sand-500">صورة</p>
                    <p className="text-xs font-bold text-ink">منظومة سكنية · </p>
                  </div>
                </div>

                {/* بطاقة الكفاءة */}
                <div className="absolute -bottom-6 -right-6 bg-ivory border border-sand-200 rounded-lg p-4 max-w-[170px] shadow-whisper hidden sm:block">
                  <p className="text-[10px] uppercase tracking-widest text-sand-500 mb-1">الكفاءة</p>
                  <p className="font-serif font-bold text-ink text-3xl leading-none nums">+95<span className="text-sun-500">٪</span></p>
                  <p className="text-xs text-sand-600 mt-2">معدّل تحويل الإنفرتر</p>
                </div>

                {/* بطاقة الضمان */}
                <div className="absolute -top-6 -left-6 bg-ink text-ivory rounded-lg p-4 max-w-[170px] hidden sm:block">
                  <p className="text-[10px] uppercase tracking-widest text-sand-400 mb-1">ضمان</p>
                  <p className="font-serif font-bold text-ivory text-3xl leading-none nums">٢٥ <span className="text-sun-400 text-xl">سنة</span></p>
                  <p className="text-xs text-sand-300 mt-2">على أداء الألواح</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* شريط الإحصائيات — على خلفية داكنة             */}
      {/* ============================================ */}
      <section className="bg-ink text-ivory">
        <div className="container-app px-5 sm:px-8 lg:px-12 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-sand-700/40">
            {[
              { value: '+٥٠٠', label: 'عميل راضٍ' },
              { value: '+١٠٠٠', label: 'منظومة مركّبة' },
              { value: '٠٣', label: 'سنوات من الخبرة' },
              { value: '٢٤/٧', label: 'دعم فنّي مستمر' },
            ].map(stat => (
              <div key={stat.label} className="px-6 first:pr-0 last:pl-0">
                <p className="font-serif font-bold text-4xl lg:text-5xl text-ivory leading-none mb-2 nums">{stat.value}</p>
                <p className="text-sand-400 text-xs uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* المنتجات المميزة — شبكة تحريريّة              */}
      {/* ============================================ */}
      <section className="section-padding">
        <div className="container-app">
          {/* عنوان القسم */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <p className="eyebrow mb-4">— مختارات المحرّر</p>
              <h2 className="display-serif text-4xl lg:text-5xl text-ink mb-4">
                المنتجات المُميَّزة
              </h2>
              <p className="text-sand-600 leading-relaxed">
                مختارة بعناية من أحدث ما يقدّمه السوق العالمي،
                بمواصفات تليق بالظروف السورية.
              </p>
            </div>
            <Link to="/shop" className="text-sun-600 font-medium hover:text-sun-700 transition-colors text-sm self-start md:self-end whitespace-nowrap">
              عرض الكلّ ←
            </Link>
          </div>

          {isLoading ? (
            <Loader text="جاري التحميل..." />
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-sand-200 rounded-lg bg-ivory">
              <p className="text-sand-500 mb-4">لا توجد منتجات مميّزة حالياً</p>
              <Link to="/shop" className="btn-secondary text-sm">تصفّح كلّ المنتجات</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* لماذا الطاقة الشمسية — نص + قائمة              */}
      {/* ============================================ */}
      <section className="bg-paper section-padding">
        <div className="container-app">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* النص الافتتاحي */}
            <div className="lg:col-span-5">
              <p className="eyebrow mb-4">— لماذا الآن؟</p>
              <h2 className="display-serif text-4xl lg:text-5xl text-ink mb-6">
                سوريا أرضٌ
                <br />
                <span className="text-leaf-500">من شمس.</span>
              </h2>
              <p className="text-sand-600 leading-relaxed mb-4">
                تتمتّع المناطق السورية بمعدّل إشعاع شمسي من
                الأعلى عالمياً، يتراوح بين ٥ و٧ ساعات يوميّاً —
                ميزة طبيعيّة تنتظر مَن يستثمرها بحكمة.
              </p>
              <p className="text-sand-600 leading-relaxed">
                لا انقطاع. لا فواتير مفاجئة. لا قلق.
                فقط طاقة نظيفة، تأتي كلّ صباح.
              </p>
            </div>

            {/* قائمة المزايا */}
            <div className="lg:col-span-7 space-y-px">
              {[
                {
                  num: '٠١',
                  title: 'استقلاليّة كهربائيّة كاملة',
                  desc: 'لا انقطاعات. منظومتك تعمل حتى حين يكون التيار الرئيسي مقطوعاً، ليلاً ونهاراً.',
                },
                {
                  num: '٠٢',
                  title: 'توفير حقيقي وطويل الأمد',
                  desc: 'بعد سنتين أو ثلاث، تحصل على طاقة شبه مجانية لعشرين سنة قادمة.',
                },
                {
                  num: '٠٣',
                  title: 'بيئة أنظف وأخفّ أثراً',
                  desc: 'كلّ كيلواط شمسي يحلّ محلّ ٧٠٠ غرام من انبعاثات الكربون.',
                },
                {
                  num: '٠٤',
                  title: 'استثمار يرفع قيمة العقار',
                  desc: 'المنازل المجهّزة بمنظومات شمسيّة ترتفع قيمتها بنسبة ٤–٧٪ في السوق.',
                },
              ].map((item, idx) => (
                <article
                  key={item.num}
                  className={`flex gap-6 py-6 ${idx !== 0 ? 'border-t border-sand-200' : ''}`}
                >
                  <span className="font-serif text-3xl text-sun-500 nums leading-none mt-1">{item.num}</span>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-ink mb-2">{item.title}</h3>
                    <p className="text-sand-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* كيف تعمل المنظومة — أربع خطوات                */}
      {/* ============================================ */}
      <section className="section-padding">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="eyebrow mb-4">— رحلة الطاقة</p>
            <h2 className="display-serif text-4xl lg:text-5xl text-ink mb-4">
              من الشمس إلى منزلك
            </h2>
            <p className="text-sand-600">أربع خطوات بسيطة، وحركة دؤوبة لا تتوقّف.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden">
            {[
              { num: '٠١', title: 'الشمس', desc: 'تُشرق وتُطلق إشعاعاً وفيراً على أراضينا', img: sun2 },
              { num: '٠٢', title: 'الألواح', desc: 'تلتقط الفوتونات وتحوّلها لكهرباء DC', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80&auto=format&fit=crop' },
              { num: '٠٣', title: 'الإنفرتر', desc: 'يحوّل التيار المستمرّ إلى تيار منزلي AC', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop' },
              { num: '٠٤', title: 'منزلك', desc: 'يستفيد من طاقة نظيفة، مجاناً، يوميّاً', img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80&auto=format&fit=crop' },
            ].map((step) => (
              <div key={step.num} className="bg-ivory">
                <div className="aspect-[4/3] overflow-hidden bg-paper">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="font-serif text-sun-500 text-2xl nums">{step.num}</span>
                    <h3 className="font-serif text-xl text-ink">{step.title}</h3>
                  </div>
                  <p className="text-sm text-sand-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* دعوة للعمل — قسم تحريري داكن                   */}
      {/* ============================================ */}
      <section className="section-padding bg-paper">
        <div className="container-app">
          <div className="relative bg-ink text-ivory rounded-lg overflow-hidden">

            {/* خطوط زخرفيّة في الخلفية */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-sun-500/30" />
              <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border border-sun-500/20" />
            </div>

            <div className="relative px-8 lg:px-16 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <p className="eyebrow text-sun-400 mb-5">— لا تعرف من أين تبدأ؟</p>
                <h2 className="display-serif text-4xl lg:text-5xl text-ivory mb-6">
                  استخدم الحاسبة الشمسيّة،
                  <br />
                  <span className="text-sun-400">في دقيقتين.</span>
                </h2>
                <p className="text-sand-300 text-lg leading-relaxed max-w-xl">
                  أدخل أجهزتك الكهربائيّة، ودَع الحاسبة تخبرك
                  تحديداً ماذا تحتاج: عدد الألواح، سعة البطاريات،
                  وحجم الإنفرتر المناسب.
                </p>
              </div>
              <div className="lg:col-span-5 flex justify-end">
                <Link to="/calculator" className="inline-flex items-center justify-center gap-3 bg-sun-500 hover:bg-sun-600 text-ivory px-8 py-4 rounded-lg font-bold transition-colors group">
                  <span>جرّب الحاسبة الآن</span>
                  <span className="group-hover:translate-x-[-3px] transition-transform">←</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
