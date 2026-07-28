import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ink text-sand-300 mt-auto">
      <div className="container-app px-5 sm:px-8 lg:px-12 pt-20 pb-10">

        {/* المنصة العلوية */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-sand-700/40">

          {/* عمود الشعار والوصف */}
          <div className="md:col-span-5">
            <Logo variant="light" size="md" />
            <p className="mt-6 text-sm leading-relaxed text-sand-400 max-w-md">
              نوفر أفضل حلول الطاقة الشمسية النظيفة والمستدامة للمنازل والمنشآت
              في سوريا — استقلالية كهربائية، توفير حقيقي، ومستقبل أنظف.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-sand-700 hover:border-sun-500 hover:text-sun-400 transition-colors flex items-center justify-center text-sand-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-sand-700 hover:border-sun-500 hover:text-sun-400 transition-colors flex items-center justify-center text-sand-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp" className="w-10 h-10 rounded-full border border-sand-700 hover:border-sun-500 hover:text-sun-400 transition-colors flex items-center justify-center text-sand-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/></svg>
              </a>
            </div>
          </div>

          {/* عمود التنقّل */}
          <div className="md:col-span-3">
            <p className="eyebrow text-sun-400 mb-5">التنقّل</p>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'الصفحة الرئيسية' },
                { to: '/shop', label: 'تصفّح المنتجات' },
                { to: '/calculator', label: 'الحاسبة الشمسية' },
                { to: '/cart', label: 'سلّة التسوّق' },
                { to: '/dashboard', label: 'حسابي الشخصي' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-sand-400 hover:text-ivory transition-colors"
                  >
                    — {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* عمود التواصل */}
          <div className="md:col-span-4">
            <p className="eyebrow text-sun-400 mb-5">تواصل معنا</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-sand-500 uppercase tracking-wider mb-1">الهاتف</p>
                <p className="text-sm font-medium text-ivory nums" dir="ltr">+963 11 000 0000</p>
              </div>
              <div>
                <p className="text-xs text-sand-500 uppercase tracking-wider mb-1">البريد</p>
                <p className="text-sm font-medium text-ivory" dir="ltr">info@shams-syria.com</p>
              </div>
              <div>
                <p className="text-xs text-sand-500 uppercase tracking-wider mb-1">العنوان</p>
                <p className="text-sm font-medium text-ivory">دمشق — الجمهورية العربية السورية</p>
              </div>
            </div>
          </div>
        </div>

        {/* الشريط السفلي */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-sand-500">
            © {currentYear} شمس سوريا · جميع الحقوق محفوظة
          </p>
          <p className="text-xs text-sand-500 font-serif">
            صُنع بحُبّ لطاقة أنظف ✦
          </p>
        </div>
      </div>
    </footer>
  )
}
