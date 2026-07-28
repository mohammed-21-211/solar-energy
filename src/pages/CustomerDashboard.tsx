import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMyOrders } from '../hooks/useOrders'
import { useSolarCalculator } from '../hooks/useSolarCalculator'
import { getOrderStatusInfo } from '../hooks/useOrders'
import { formatPrice } from '../components/ProductCard'
import Loader from '../components/Loader'

// ======================================================
// لوحة تحكم العميل
// ======================================================

export default function CustomerDashboard() {
  const { profile } = useAuth()
  const { orders, isLoading: ordersLoading } = useMyOrders()
  const { savedCalculations, isLoadingSaved, fetchSavedCalculations, deleteCalculation } = useSolarCalculator()

  useEffect(() => { fetchSavedCalculations() }, [])

  return (
    <div className="animate-fade-in">

      {/* رأس الصفحة */}
      <section className="bg-paper border-b border-sand-200">
        <div className="container-app px-5 sm:px-8 lg:px-12 py-14">
          <p className="eyebrow mb-3">— مرحباً بك</p>
          <h1 className="display-serif text-5xl text-ink">
            أهلاً، {profile?.full_name?.split(' ')[0] ?? 'عزيزنا'}.
          </h1>
          <p className="text-sand-600 mt-3">تابع طلباتك وحسابات الطاقة المحفوظة في مكان واحد.</p>
        </div>
      </section>

      <div className="container-app px-5 sm:px-8 lg:px-12 py-12">

        {/* بطاقات الإحصاء */}
        <div className="grid sm:grid-cols-3 gap-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden mb-12">
          {[
            { label: 'إجمالي الطلبات',   value: orders.length },
            { label: 'قيد المراجعة',     value: orders.filter(o => o.status === 'pending').length },
            { label: 'حسابات محفوظة',    value: savedCalculations.length },
          ].map(stat => (
            <div key={stat.label} className="bg-ivory p-6">
              <p className="eyebrow text-sand-500 mb-3">{stat.label}</p>
              <p className="font-serif font-bold text-5xl text-ink nums leading-none">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ===== طلباتي ===== */}
        <section className="mb-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-serif text-3xl text-ink">طلباتي</h2>
            <p className="eyebrow text-sand-500">{orders.length} طلب</p>
          </div>

          {ordersLoading ? (
            <Loader text="جاري التحميل..." />
          ) : orders.length === 0 ? (
            <div className="bg-ivory border border-sand-200 rounded-lg p-12 text-center">
              <p className="font-serif text-xl text-sand-700 mb-2">لا طلبات بعد</p>
              <p className="text-sm text-sand-500 mb-6">ابدأ بتصفّح متجرنا</p>
              <Link to="/shop" className="btn-secondary text-sm">تصفّح المتجر</Link>
            </div>
          ) : (
            <div className="space-y-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden">
              {orders.map(order => {
                const statusInfo = getOrderStatusInfo(order.status)
                return (
                  <article key={order.id} className="bg-ivory p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="font-serif text-lg text-ink nums">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-sand-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString('ar-SY', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`tag ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="font-serif font-bold text-ink text-lg nums">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* عناصر الطلب */}
                    {order.items?.length > 0 && (
                      <div className="bg-paper rounded p-3 space-y-1.5">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-sand-700">— {item.product?.name ?? 'منتج'} × {item.quantity}</span>
                            <span className="text-ink font-medium nums">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-4 pt-4 border-t border-sand-200 text-xs text-sand-500">
                      التسليم: {order.shipping_address} · الهاتف: {order.phone}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ===== الحسابات المحفوظة ===== */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-serif text-3xl text-ink">حسابات الطاقة</h2>
            <p className="eyebrow text-sand-500">{savedCalculations.length} حساب</p>
          </div>

          {isLoadingSaved ? (
            <Loader text="جاري التحميل..." />
          ) : savedCalculations.length === 0 ? (
            <div className="bg-ivory border border-sand-200 rounded-lg p-12 text-center">
              <p className="font-serif text-xl text-sand-700 mb-2">لا حسابات محفوظة</p>
              <p className="text-sm text-sand-500 mb-6">جرّب الحاسبة الشمسيّة واحفظ حساباتك للرجوع إليها</p>
              <Link to="/calculator" className="btn-secondary text-sm">جرّب الحاسبة</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden">
              {savedCalculations.map(calc => {
                const result = calc.result_data as unknown as Record<string, number>
                return (
                  <article key={calc.id} className="bg-ivory p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className="font-serif text-lg text-ink">{calc.name}</h3>
                        <p className="text-xs text-sand-500 mt-1">
                          {new Date(calc.created_at).toLocaleDateString('ar-SY')}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCalculation(calc.id)}
                        className="text-sand-400 hover:text-red-600 transition-colors text-xs"
                      >
                        حذف
                      </button>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-sand-600">— الألواح</span><span className="font-bold text-ink nums">{result.panelCount} لوح</span></li>
                      <li className="flex justify-between"><span className="text-sand-600">— البطاريات</span><span className="font-bold text-ink nums">{result.batteryCapacityKwh} kWh</span></li>
                      <li className="flex justify-between"><span className="text-sand-600">— الإنفرتر</span><span className="font-bold text-ink nums">{result.inverterKva} kVA</span></li>
                      <li className="flex justify-between"><span className="text-sand-600">— استهلاك يومي</span><span className="font-bold text-ink nums">{result.totalDailyWh} Wh</span></li>
                    </ul>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
