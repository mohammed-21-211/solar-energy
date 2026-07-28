import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-warm px-4">
      <div className="text-center max-w-md animate-fade-in">
        <p className="eyebrow mb-4">— خطأ ٤٠٤</p>
        <h1 className="display-serif text-7xl lg:text-8xl text-ink mb-4 nums">404</h1>
        <h2 className="font-serif text-2xl text-ink mb-3">الصفحة غير موجودة</h2>
        <p className="text-sand-600 mb-10 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير متاحة أو تم نقلها.
          ربّما حان وقت العودة إلى الشمس.
        </p>
        <Link to="/" className="btn-primary px-8 py-3.5">العودة إلى الرئيسية</Link>
      </div>
    </div>
  )
}
