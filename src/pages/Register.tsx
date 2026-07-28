import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) { toast.error('يرجى ملء الحقول المطلوبة'); return }
    if (form.password.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    if (form.password !== form.confirm) { toast.error('كلمتا المرور غير متطابقتين'); return }

    setIsLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone || undefined)
    setIsLoading(false)

    if (error) {
      if (error.includes('already registered')) toast.error('هذا البريد الإلكتروني مسجّل مسبقاً')
      else toast.error(error)
    } else {
      toast.success('تم إنشاء حسابك بنجاح! أهلاً بك')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex bg-paper animate-fade-in">

      <aside className="hidden lg:flex lg:w-1/2 bg-ink text-ivory relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full border border-sun-500/40" />
          <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] rounded-full border border-sun-500/20" />
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
            <p className="eyebrow text-sun-400 mb-6">— انضمّ إلينا</p>
            <h2 className="display-serif text-5xl xl:text-6xl text-ivory mb-6 leading-[1.05]">
              ابدأ رحلتك<br />
              نحو <span className="text-sun-400">طاقة نظيفة.</span>
            </h2>
            <p className="text-sand-300 leading-relaxed max-w-md">
              احفظ حسابات الطاقة، تابع طلباتك،
              وكن جزءاً من مستقبل طاقوي أنظف.
            </p>
          </div>

          <p className="text-xs text-sand-500">© شمس سوريا · للطاقة الشمسيّة</p>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/sun.svg" alt="" className="w-10 h-10" />
              <span className="font-serif font-bold text-xl text-ink">شمس سوريا</span>
            </Link>
          </div>

          <p className="eyebrow mb-3">— حساب جديد</p>
          <h1 className="display-serif text-4xl text-ink mb-3">انضمّ إلى عائلتنا.</h1>
          <p className="text-sand-600 text-sm mb-8">لديك حساب بالفعل؟ <Link to="/login" className="link">سجّل دخولك</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">الاسم الكامل *</label>
              <input type="text" value={form.fullName} onChange={update('fullName')} placeholder="محمد أحمد" className="input-field" required />
            </div>

            <div>
              <label className="label-field">البريد الإلكتروني *</label>
              <input type="email" value={form.email} onChange={update('email')} placeholder="example@email.com" dir="ltr" className="input-field" required />
            </div>

            <div>
              <label className="label-field">الهاتف (اختياري)</label>
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+963 XXX XXX XXX" dir="ltr" className="input-field" />
            </div>

            <div>
              <label className="label-field">كلمة المرور *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="٦ أحرف على الأقل"
                  className="input-field pl-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-ink text-xs uppercase tracking-wider font-bold">
                  {showPassword ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </div>

            <div>
              <label className="label-field">تأكيد كلمة المرور *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="أعد كتابة كلمة المرور"
                className={`input-field ${form.confirm && form.confirm !== form.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-600 mt-1.5">كلمتا المرور غير متطابقتين</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-3">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                  جاري إنشاء الحساب...
                </span>
              ) : 'إنشاء الحساب'}
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
