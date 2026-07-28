import { useProducts, getCategoryLabel } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import type { ProductCategory } from '../types'

const CATEGORIES: Array<ProductCategory | 'all'> = ['all', 'panel', 'battery', 'inverter', 'accessory']
const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_asc', label: 'السعر · الأقل' },
  { value: 'price_desc', label: 'السعر · الأعلى' },
  { value: 'popular', label: 'الأكثر شيوعاً' },
]

export default function Shop() {
  const { products, isLoading, error, filter, updateFilter, resetFilter } = useProducts()

  return (
    <div className="animate-fade-in">

      {/* رأس الصفحة — مَسَاحَة تحريريّة */}
      <section className="bg-paper border-b border-sand-200">
        <div className="container-app px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
          <p className="eyebrow mb-4">— كتالوج المنتجات</p>
          <h1 className="display-serif text-5xl lg:text-6xl text-ink mb-4">
            متجر الطاقة
          </h1>
          <p className="text-sand-600 max-w-xl leading-relaxed">
            مجموعة منتقاة من الألواح والبطاريات والإنفرترات والملحقات،
            بمعايير عالميّة وأسعار سوريّة.
          </p>
        </div>
      </section>

      <div className="container-app px-5 sm:px-8 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ===== الشريط الجانبي ===== */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-8">

              {/* الفئة */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="eyebrow">الفئة</p>
                  <button onClick={resetFilter} className="text-xs text-sun-600 hover:text-sun-700 font-medium">
                    إعادة تعيين
                  </button>
                </div>
                <ul className="space-y-2">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button
                        onClick={() => updateFilter({ category: cat })}
                        className={`text-right w-full text-sm transition-colors py-1 ${
                          filter.category === cat
                            ? 'text-ink font-bold'
                            : 'text-sand-600 hover:text-ink'
                        }`}
                      >
                        {filter.category === cat && <span className="text-sun-500 ml-1">●</span>}
                        {getCategoryLabel(cat)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* البحث */}
              <div>
                <label className="label-field">بحث</label>
                <input
                  type="search"
                  placeholder="ابحث عن منتج..."
                  value={filter.searchQuery}
                  onChange={e => updateFilter({ searchQuery: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              {/* الترتيب */}
              <div>
                <label className="label-field">ترتيب</label>
                <select
                  value={filter.sortBy}
                  onChange={e => updateFilter({ sortBy: e.target.value as typeof filter.sortBy })}
                  className="input-field text-sm"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* ===== شبكة المنتجات ===== */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-sand-200">
              <p className="text-sm text-sand-600 nums">
                {isLoading ? 'جاري التحميل...' : `${products.length} منتج`}
              </p>
            </div>

            {isLoading ? (
              <Loader text="جاري تحميل المنتجات..." />
            ) : error ? (
              <div className="text-center py-20 border border-red-200 bg-red-50/50 rounded-lg">
                <p className="text-red-700 font-medium mb-2">حدث خطأ</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-sand-200 rounded-lg bg-ivory">
                <p className="font-serif text-2xl text-ink mb-2">لا نتائج</p>
                <p className="text-sand-500 mb-6">لم نعثر على منتجات تطابق بحثك</p>
                <button onClick={resetFilter} className="btn-secondary text-sm">مسح الفلاتر</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
