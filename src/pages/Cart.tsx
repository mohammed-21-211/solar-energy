import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCreateOrder } from '../hooks/useOrders'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../components/ProductCard'
import toast from 'react-hot-toast'

export default function Cart() {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()
  const { createOrder, isSubmitting } = useCreateOrder()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [showCheckout, setShowCheckout] = useState(false)
  const [orderForm, setOrderForm] = useState({ address: '', phone: '', notes: '' })

  const updateForm = (field: keyof typeof orderForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setOrderForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleOrder = async () => {
    if (!orderForm.address || !orderForm.phone) { toast.error('يرجى ملء عنوان الشحن والهاتف'); return }

    const { error } = await createOrder({
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, unitPrice: i.product.price })),
      totalAmount: totalPrice,
      shippingAddress: orderForm.address,
      phone: orderForm.phone,
      notes: orderForm.notes || undefined,
    })

    if (error) {
      toast.error(error)
    } else {
      clearCart()
      toast.success('تم تقديم طلبك بنجاح! سنتواصل معك قريباً')
      navigate('/dashboard')
    }
  }

  if (totalItems === 0) {
    return (
      <div className="animate-fade-in">
        <div className="container-app px-5 sm:px-8 lg:px-12 py-24">
          <div className="max-w-md mx-auto text-center">
            <p className="eyebrow mb-6">— سلّة فارغة</p>
            <h1 className="display-serif text-4xl text-ink mb-4">لم تختر شيئاً بعد</h1>
            <p className="text-sand-600 mb-10">ابدأ من المتجر، واختر ما يناسبك بهدوء.</p>
            <Link to="/shop" className="btn-primary px-8 py-3.5">تصفّح المتجر</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">

      {/* الرأس */}
      <section className="bg-paper border-b border-sand-200">
        <div className="container-app px-5 sm:px-8 lg:px-12 py-12">
          <p className="eyebrow mb-3">— سلّة التسوّق</p>
          <h1 className="display-serif text-4xl lg:text-5xl text-ink nums">
            {totalItems} <span className="text-sand-500 text-2xl">عنصر</span>
          </h1>
        </div>
      </section>

      <div className="container-app px-5 sm:px-8 lg:px-12 py-12">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* ===== قائمة المنتجات ===== */}
          <div className="lg:col-span-8 space-y-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-ivory p-5 flex gap-5">
                <img
                  src={product.image_url || `https://placehold.co/120x120/FAF7F2/1C1A17?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded border border-sand-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="font-serif text-lg text-ink mb-1 truncate">{product.name}</h3>
                  <p className="text-sun-600 font-bold text-sm nums mb-3">{formatPrice(product.price)}</p>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className="inline-flex items-center border border-sand-300 rounded overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 hover:bg-paper transition-colors text-ink font-bold"
                      >−</button>
                      <span className="px-3 py-1 font-bold text-ink min-w-[2.5rem] text-center text-sm nums border-r border-l border-sand-300">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock_quantity}
                        className="w-8 h-8 hover:bg-paper transition-colors text-ink font-bold disabled:opacity-30"
                      >+</button>
                    </div>

                    <button
                      onClick={() => { removeFromCart(product.id); toast.success('تم إزالة المنتج') }}
                      className="text-xs text-sand-500 hover:text-red-600 transition-colors underline-offset-2 hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-xs text-sand-500 uppercase tracking-wider mb-1">المجموع</p>
                  <p className="font-serif font-bold text-ink text-xl nums">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ===== ملخص الطلب ===== */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 bg-ivory border border-sand-200 rounded-lg p-7">
              <p className="eyebrow mb-4">— ملخّص الطلب</p>
              <h2 className="font-serif text-2xl text-ink mb-6">المجموع النهائي</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-sand-200">
                <div className="flex justify-between text-sm">
                  <span className="text-sand-600">عدد المنتجات</span>
                  <span className="text-ink font-medium nums">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sand-600">الشحن</span>
                  <span className="text-sand-500">يُحدَّد لاحقاً</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-sm text-sand-600">الإجمالي</span>
                <span className="font-serif font-bold text-ink text-2xl nums">{formatPrice(totalPrice)}</span>
              </div>

              {!user ? (
                <div className="space-y-3">
                  <Link to="/login" state={{ from: { pathname: '/cart' } }} className="btn-primary w-full py-3.5 text-sm">
                    سجّل دخولك لإتمام الطلب
                  </Link>
                  <Link to="/register" className="btn-secondary w-full py-3 text-sm">إنشاء حساب</Link>
                </div>
              ) : !showCheckout ? (
                <button onClick={() => setShowCheckout(true)} className="btn-primary w-full py-3.5 text-sm">
                  إتمام الطلب
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="eyebrow mb-2">— بيانات التوصيل</p>
                  <div>
                    <label className="label-field">العنوان *</label>
                    <input type="text" value={orderForm.address} onChange={updateForm('address')} placeholder="المحافظة، الحي، الشارع..." className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="label-field">الهاتف *</label>
                    <input type="tel" value={orderForm.phone} onChange={updateForm('phone')} placeholder="+963..." dir="ltr" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="label-field">ملاحظات</label>
                    <textarea value={orderForm.notes} onChange={updateForm('notes')} placeholder="تعليمات خاصة (اختياري)" className="input-field text-sm min-h-[70px] resize-none" />
                  </div>
                  <button onClick={handleOrder} disabled={isSubmitting} className="btn-primary w-full py-3.5 text-sm">
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                        جاري التقديم...
                      </span>
                    ) : 'تأكيد الطلب'}
                  </button>
                  <button onClick={() => setShowCheckout(false)} className="text-xs text-sand-500 hover:text-ink transition-colors w-full text-center pt-2">← رجوع</button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
