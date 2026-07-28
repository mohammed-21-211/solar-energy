import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Logo from './Logo'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('تم تسجيل الخروج بنجاح')
    navigate('/')
    setUserMenuOpen(false)
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative font-medium text-sm transition-colors py-1 ${
      isActive
        ? 'text-ink'
        : 'text-sand-600 hover:text-ink'
    }`

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-sand-200">
      <div className="container-app px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">

          {/* الشعار */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* روابط التنقل — سطح المكتب */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { to: '/', label: 'الرئيسية', end: true },
              { to: '/shop', label: 'المتجر' },
              { to: '/calculator', label: 'الحاسبة' },
            ].map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-1 right-0 left-0 h-px bg-sun-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* الجانب الأيسر */}
          <div className="flex items-center gap-1">

            {/* سلة التسوق */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-lg text-sand-700 hover:text-ink hover:bg-sand-100 transition-colors"
              aria-label="سلة التسوق"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sun-500 text-ivory text-[10px] font-bold flex items-center justify-center leading-none nums">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* قائمة المستخدم */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-sand-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-ink text-ivory flex items-center justify-center text-sm font-bold">
                    {profile?.full_name?.charAt(0) ?? 'م'}
                  </div>
                  <span className="text-sm font-medium text-sand-700 max-w-[100px] truncate">
                    {profile?.full_name?.split(' ')[0] ?? 'المستخدم'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-sand-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute left-0 mt-2 w-56 bg-ivory rounded-xl shadow-lift border border-sand-200 z-20 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-sand-200 bg-paper">
                        <p className="font-bold text-ink text-sm truncate">{profile?.full_name}</p>
                        <p className="text-xs text-sand-500 truncate mt-0.5">{profile?.email}</p>
                        {isAdmin && (
                          <span className="tag bg-sun-100 text-sun-700 mt-2">مدير</span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          to={isAdmin ? '/admin' : '/dashboard'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-sand-700 hover:bg-paper transition-colors"
                        >
                          <span className="text-sand-400">›</span>
                          {isAdmin ? 'لوحة التحكم' : 'حسابي'}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-right"
                        >
                          <span className="text-red-400">›</span>
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 mr-2">
                <Link to="/login" className="text-sm font-medium text-sand-700 hover:text-ink transition-colors px-3 py-2">
                  دخول
                </Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2">تسجيل</Link>
              </div>
            )}

            {/* زر القائمة على الجوال */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-ink hover:bg-sand-100 transition-colors"
              aria-label="فتح القائمة"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* قائمة الجوال */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-sand-200 space-y-0.5 animate-slide-up">
            {[
              { to: '/', label: 'الرئيسية', end: true },
              { to: '/shop', label: 'المتجر' },
              { to: '/calculator', label: 'الحاسبة' },
            ].map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    isActive ? 'bg-paper text-ink' : 'text-sand-600 hover:bg-paper hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-3 mt-3 border-t border-sand-200">
              {user ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg font-medium text-sm text-sand-700 hover:bg-paper"
                  >
                    {isAdmin ? 'لوحة التحكم' : 'حسابي'}
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-right px-4 py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50">
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-sm py-2.5">دخول</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-sm py-2.5">تسجيل</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
