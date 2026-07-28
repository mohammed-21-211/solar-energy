import { useCart } from '../context/CartContext'
import type { Product } from '../types'
import { getCategoryLabel } from '../hooks/useProducts'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
}

// دالة لتنسيق السعر بالليرة السورية
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-SY', {
    style: 'currency',
    currency: 'SYP',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addToCart, isInCart } = useCart()
  const alreadyInCart = isInCart(product.id)

  const handleAddToCart = () => {
    if (product.stock_quantity === 0) return
    addToCart(product, 1)
    toast.success(`تمت إضافة "${product.name}" إلى السلة`)
  }

  const categoryColors: Record<string, string> = {
    panel:     'bg-sun-100 text-sun-700',
    battery:   'bg-sky2-100 text-sky2-700',
    inverter:  'bg-leaf-100 text-leaf-700',
    accessory: 'bg-sand-200 text-sand-700',
  }

  return (
    <article className="group card card-hover flex flex-col h-full">
      {/* صورة المنتج */}
      <div className="relative overflow-hidden bg-paper aspect-[4/3]">
        <img
          src={product.image_url || `https://placehold.co/400x300/FAF7F2/1C1A17?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* شارة "مميز" */}
        {product.is_featured && (
          <span className="absolute top-3 right-3 tag bg-ivory text-ink border border-sand-200">
            ✦ مميز
          </span>
        )}

        {/* شارة "نفد المخزون" */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="tag bg-ivory text-ink px-3 py-1 text-sm">نفد المخزون</span>
          </div>
        )}
      </div>

      {/* تفاصيل المنتج */}
      <div className="p-5 flex-1 flex flex-col">
        {/* eyebrow الفئة */}
        <span className={`tag mb-3 ${categoryColors[product.category] ?? 'bg-sand-200 text-sand-700'}`}>
          {getCategoryLabel(product.category)}
        </span>

        {/* اسم المنتج — تحريري */}
        <h3 className="font-serif text-xl text-ink mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* وصف مختصر */}
        <p className="text-sm text-sand-600 line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* المواصفات التقنية كقائمة بـ en-dash */}
        {(product.power_watts || product.capacity_kwh || product.voltage) && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-sand-600 nums">
            {product.power_watts && (
              <li>— <span className="font-bold text-ink">{product.power_watts}</span> واط</li>
            )}
            {product.capacity_kwh && (
              <li>— <span className="font-bold text-ink">{product.capacity_kwh}</span> kWh</li>
            )}
            {product.voltage && (
              <li>— <span className="font-bold text-ink">{product.voltage}</span> فولت</li>
            )}
          </ul>
        )}

        {/* السعر والإجراءات */}
        <div className="flex items-end justify-between pt-4 border-t border-sand-200">
          <div>
            <p className="text-xs text-sand-500 uppercase tracking-wider mb-1">السعر</p>
            <p className="font-serif font-bold text-ink text-xl leading-none nums">
              {formatPrice(product.price)}
            </p>
            {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
              <p className="text-xs text-sun-600 mt-1.5 nums">باقي {product.stock_quantity} فقط</p>
            )}
          </div>

          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || alreadyInCart}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                alreadyInCart
                  ? 'bg-leaf-100 text-leaf-600 cursor-default'
                  : product.stock_quantity === 0
                  ? 'bg-sand-200 text-sand-500 cursor-not-allowed'
                  : 'bg-ink text-ivory hover:bg-sun-500'
              }`}
            >
              {alreadyInCart ? '✓ في السلة' : 'أضِف'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
