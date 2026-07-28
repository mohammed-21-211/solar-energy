import { useState } from 'react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useAllOrders, useUpdateOrderStatus, getOrderStatusInfo } from '../hooks/useOrders'
import { useProducts, useAdminProducts } from '../hooks/useProducts'
import { formatPrice } from '../components/ProductCard'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import type { OrderStatus, Product, ProductCategory } from '../types'

type AdminTab = 'overview' | 'orders' | 'products'

// ======================================================
// لوحة تحكم المدير
// ======================================================

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  return (
    <div className="animate-fade-in">

      {/* الرأس */}
      <section className="bg-paper border-b border-sand-200">
        <div className="container-app px-5 sm:px-8 lg:px-12 py-14">
          <p className="eyebrow mb-3">— لوحة المدير</p>
          <h1 className="display-serif text-5xl text-ink">إدارة المتجر</h1>
          <p className="text-sand-600 mt-3">المنتجات، الطلبات، والإحصائيّات في مكان واحد.</p>
        </div>
      </section>

      <div className="container-app px-5 sm:px-8 lg:px-12 py-10">

        {/* تبويبات */}
        <div className="border-b border-sand-200 mb-10">
          <div className="flex gap-1 -mb-px">
            {([
              { id: 'overview', label: 'نظرة عامّة' },
              { id: 'orders',   label: 'الطلبات' },
              { id: 'products', label: 'المنتجات' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-sun-500 text-ink font-bold'
                    : 'border-transparent text-sand-500 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'orders'   && <OrdersTab />}
        {activeTab === 'products' && <ProductsTab />}
      </div>
    </div>
  )
}

// ===== تبويب نظرة عامة =====
function OverviewTab() {
  const { stats, isLoading } = useDashboardStats()
  if (isLoading) return <Loader text="جاري التحميل..." />

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden">
      {[
        { label: 'إجمالي الطلبات',   value: stats.totalOrders },
        { label: 'طلبات معلَّقة',     value: stats.pendingOrders },
        { label: 'الإيرادات',         value: formatPrice(stats.totalRevenue) },
        { label: 'عدد المنتجات',      value: stats.totalProducts },
      ].map(stat => (
        <div key={stat.label} className="bg-ivory p-6">
          <p className="eyebrow text-sand-500 mb-3">{stat.label}</p>
          <p className="font-serif font-bold text-3xl xl:text-4xl text-ink nums leading-none">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

// ===== تبويب الطلبات =====
function OrdersTab() {
  const { orders, isLoading, refetch } = useAllOrders()
  const { updateStatus, isUpdating } = useUpdateOrderStatus()

  const ORDER_STATUSES: Array<{ value: OrderStatus; label: string }> = [
    { value: 'pending',   label: 'قيد المراجعة' },
    { value: 'confirmed', label: 'مؤكّد' },
    { value: 'shipped',   label: 'تمّ الشحن' },
    { value: 'delivered', label: 'تمّ التسليم' },
    { value: 'cancelled', label: 'ملغي' },
  ]

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const { error } = await updateStatus(orderId, status)
    if (error) toast.error(error)
    else { toast.success('تم تحديث الحالة'); refetch() }
  }

  if (isLoading) return <Loader text="جاري التحميل..." />

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-2xl text-ink">{orders.length} طلب إجمالاً</h2>
      </div>

      {orders.length === 0 ? (
        <div className="bg-ivory border border-sand-200 rounded-lg p-12 text-center">
          <p className="font-serif text-xl text-sand-700">لا طلبات بعد</p>
        </div>
      ) : (
        <div className="space-y-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden">
          {orders.map(order => {
            const statusInfo = getOrderStatusInfo(order.status)
            const customer = (order as any).user
            return (
              <article key={order.id} className="bg-ivory p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-serif text-lg text-ink nums">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-sand-700 mt-1">
                      {customer?.full_name ?? 'عميل'} · {customer?.phone ?? order.phone}
                    </p>
                    <p className="text-xs text-sand-500 mt-0.5">
                      {new Date(order.created_at).toLocaleString('ar-SY')}
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

                {order.items?.length > 0 && (
                  <div className="bg-paper rounded p-3 mb-4 text-sm space-y-1">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-sand-700">— {item.product?.name ?? 'منتج'} × {item.quantity}</span>
                        <span className="text-ink nums">{formatPrice(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-sand-200">
                  <p className="text-xs text-sand-500">📍 {order.shipping_address}</p>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    disabled={isUpdating}
                    className="input-field py-1.5 text-sm w-auto"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ===== تبويب المنتجات =====
type ImageSource = 'url' | 'upload'

function ProductsTab() {
  const { products, isLoading, refetch } = useProducts()
  const { createProduct, updateProduct, deleteProduct, isSubmitting } = useAdminProducts()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageSource, setImageSource] = useState<ImageSource>('url')

  const emptyForm = {
    name: '', description: '', price: 0, category: 'panel' as ProductCategory,
    image_url: '', power_watts: null as number | null, capacity_kwh: null as number | null,
    voltage: null as number | null, stock_quantity: 10, is_featured: false,
  }
  const [form, setForm] = useState(emptyForm)

  const openNew   = () => { setForm(emptyForm); setEditingProduct(null); setImageSource('url'); setShowForm(true) }
  const openEdit  = (p: Product) => {
    setForm({
      name: p.name, description: p.description, price: p.price, category: p.category,
      image_url: p.image_url, power_watts: p.power_watts ?? null,
      capacity_kwh: p.capacity_kwh ?? null, voltage: p.voltage ?? null,
      stock_quantity: p.stock_quantity, is_featured: p.is_featured,
    })
    setEditingProduct(p)
    setImageSource(p.image_url.startsWith('data:') ? 'upload' : 'url')
    setShowForm(true)
  }

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('يرجى اختيار ملف صورة'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('حجم الصورة يجب ألا يتجاوز 2 ميغابايت'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(p => ({ ...p, image_url: String(reader.result) }))
    reader.onerror = () => toast.error('تعذّر قراءة الصورة')
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name || !form.description || form.price <= 0) { toast.error('يرجى ملء الحقول المطلوبة'); return }
    const payload = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      power_watts: form.power_watts ?? undefined,
      capacity_kwh: form.capacity_kwh ?? undefined,
      voltage: form.voltage ?? undefined,
    }

    const { error } = editingProduct
      ? await updateProduct(editingProduct.id, payload)
      : await createProduct(payload)

    if (error) toast.error(error)
    else {
      toast.success(editingProduct ? 'تم تحديث المنتج' : 'تم إضافة المنتج')
      setShowForm(false)
      refetch()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return
    const { error } = await deleteProduct(id)
    if (error) toast.error(error)
    else { toast.success('تم حذف المنتج'); refetch() }
  }

  if (isLoading) return <Loader text="جاري التحميل..." />

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-2xl text-ink">{products.length} منتج</h2>
        <button onClick={openNew} className="btn-primary text-sm py-2.5 px-5">+ إضافة منتج</button>
      </div>

      {/* نموذج إضافة/تعديل */}
      {showForm && (
        <div className="bg-ivory border-2 border-sun-500 rounded-lg p-7 mb-6">
          <p className="eyebrow mb-2">— {editingProduct ? 'تعديل' : 'منتج جديد'}</p>
          <h3 className="font-serif text-2xl text-ink mb-6">
            {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">اسم المنتج *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" />
            </div>
            <div>
              <label className="label-field">الفئة *</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value as ProductCategory}))} className="input-field">
                <option value="panel">لوح شمسي</option>
                <option value="battery">بطارية</option>
                <option value="inverter">إنفرتر</option>
                <option value="accessory">ملحقات</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">الوصف *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="input-field min-h-[80px]" />
            </div>
            <div>
              <label className="label-field">السعر (ل.س) *</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: Number(e.target.value)}))} className="input-field" min={0} />
            </div>
            <div>
              <label className="label-field">المخزون</label>
              <input type="number" value={form.stock_quantity} onChange={e => setForm(p => ({...p, stock_quantity: Number(e.target.value)}))} className="input-field" min={0} />
            </div>
            <div>
              <label className="label-field">القدرة (واط)</label>
              <input type="number" value={form.power_watts ?? ''} onChange={e => setForm(p => ({...p, power_watts: e.target.value ? Number(e.target.value) : null}))} className="input-field" min={0} />
            </div>
            <div>
              <label className="label-field">السعة (kWh)</label>
              <input type="number" value={form.capacity_kwh ?? ''} onChange={e => setForm(p => ({...p, capacity_kwh: e.target.value ? Number(e.target.value) : null}))} className="input-field" min={0} step={0.1} />
            </div>
            <div>
              <label className="label-field">الجهد (V)</label>
              <input type="number" value={form.voltage ?? ''} onChange={e => setForm(p => ({...p, voltage: e.target.value ? Number(e.target.value) : null}))} className="input-field" min={0} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">صورة المنتج</label>

              {/* تبديل بين رابط من الإنترنت أو تحميل من الجهاز */}
              <div className="inline-flex rounded-md border border-sand-200 bg-paper p-0.5 mb-3">
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                    imageSource === 'url' ? 'bg-ink text-ivory' : 'text-sand-600 hover:text-ink'
                  }`}
                >
                  رابط من الإنترنت
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                    imageSource === 'upload' ? 'bg-ink text-ivory' : 'text-sand-600 hover:text-ink'
                  }`}
                >
                  تحميل من الجهاز
                </button>
              </div>

              {imageSource === 'url' ? (
                <input
                  type="url"
                  value={form.image_url.startsWith('data:') ? '' : form.image_url}
                  onChange={e => setForm(p => ({...p, image_url: e.target.value}))}
                  placeholder="https://..."
                  dir="ltr"
                  className="input-field"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                    className="block w-full text-sm text-sand-700 file:ml-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-ink file:text-ivory file:font-medium file:cursor-pointer hover:file:bg-sand-800"
                  />
                </div>
              )}

              {form.image_url && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={form.image_url} alt="معاينة" className="w-20 h-20 object-cover rounded border border-sand-200" />
                  <button
                    type="button"
                    onClick={() => setForm(p => ({...p, image_url: ''}))}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    إزالة الصورة
                  </button>
                </div>
              )}
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.is_featured}
                onChange={e => setForm(p => ({...p, is_featured: e.target.checked}))}
                className="w-4 h-4 accent-sun-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-sand-700">منتج مميّز (يظهر في الصفحة الرئيسية)</label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-sand-200">
            <button onClick={handleSave} disabled={isSubmitting} className="btn-primary text-sm py-2.5 px-6">
              {isSubmitting ? 'جاري الحفظ...' : (editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج')}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {/* جدول المنتجات */}
      <div className="bg-ivory border border-sand-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-sand-200">
              <tr>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">المنتج</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">الفئة</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">السعر</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">المخزون</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">مميّز</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t border-sand-100 hover:bg-paper/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{product.name}</p>
                    {product.power_watts && <p className="text-xs text-sand-500 nums">{product.power_watts}W</p>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="tag bg-sand-200 text-sand-700">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-ink nums">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium nums ${product.stock_quantity === 0 ? 'text-red-600' : 'text-ink'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sun-500">
                    {product.is_featured ? '✦' : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEdit(product)} className="text-xs font-medium text-ink hover:text-sun-600 px-2 py-1 transition-colors">
                        تعديل
                      </button>
                      <span className="text-sand-300">·</span>
                      <button onClick={() => handleDelete(product.id, product.name)} className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 transition-colors">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
