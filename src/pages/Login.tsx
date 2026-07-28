import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (user) {
    navigate(from, { replace: true })
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('يرجى ملء جميع الحقول'); return }
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)
    if (error) {
      toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    } else {
      toast.success('مرحباً بعودتك!')
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex bg-paper animate-fade-in">

      {/* اللوحة اليمنى — تحريرية */}
      <aside className="hidden lg:flex lg:w-1/2 bg-ink text-ivory relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-sun-500/40" />
          <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full border border-sun-500/30" />
        </div>
        <div className="relative flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link to="/" className="flex items-center gap-3">
            <img src="/sun.svg" alt="" className="w-10 h-10" />
            <div>
              <p className="font-serif font-bold text-lg">شمس سوريا</p>
              <p className="text-[10px] uppercase tracking-widest text-sand-400">Shams Syria · Solar</p>
            </div>
          </Link>

          <div>
            <p className="eyebrow text-sun-400 mb-6">— أهلاً بعودتك</p>
            <h2 className="display-serif text-5xl xl:text-6xl text-ivory mb-6 leading-[1.05]">
              عُد إلى<br />
              <span className="text-sun-400">شمس</span> منزلك.
            </h2>
            <p className="text-sand-300 leading-relaxed max-w-md">
              تابع طلباتك، احفظ حساباتك للطاقة،
              واصنع منظومتك بهدوء.
            </p>
          </div>

          <p className="text-xs text-sand-500">© شمس سوريا · للطاقة الشمسيّة</p>
        </div>
      </aside>

      {/* اللوحة اليسرى — النموذج */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/sun.svg" alt="" className="w-10 h-10" />
              <span className="font-serif font-bold text-xl text-ink">شمس سوريا</span>
            </Link>
          </div>

          <p className="eyebrow mb-3">— تسجيل الدخول</p>
          <h1 className="display-serif text-4xl text-ink mb-3">أهلاً بعودتك.</h1>
          <p className="text-sand-600 text-sm mb-10">ليس لديك حساب؟ <Link to="/register" className="link">سجّل الآن</Link></p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="input-field"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="label-field">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-ink text-xs uppercase tracking-wider font-bold"
                >
                  {showPassword ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-2">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                  جاري الدخول...
                </span>
              ) : 'دخول إلى حسابي'}
            </button>
          </form>

          <p className="text-center mt-8">
            <Link to="/" className="text-xs text-sand-500 hover:text-ink transition-colors">
              ← العودة إلى الموقع
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
