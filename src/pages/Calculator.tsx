import { useState } from 'react'
import { useSolarCalculator, COMMON_APPLIANCES } from '../hooks/useSolarCalculator'
import { useAuth } from '../context/AuthContext'
import type { ApplianceInput, SolarCalculationInput } from '../types'
import toast from 'react-hot-toast'

// ======================================================
// حاسبة الطاقة الشمسية الذكية
// ======================================================

let applianceCounter = 0
const newId = () => `app-${++applianceCounter}`

const DEFAULT_APPLIANCES: ApplianceInput[] = [
  { id: newId(), name: 'تلفزيون LED', watts: 80,  hoursPerDay: 6, quantity: 1 },
  { id: newId(), name: 'ثلاجة',       watts: 150, hoursPerDay: 8, quantity: 1 },
  { id: newId(), name: 'إضاءة LED',    watts: 12,  hoursPerDay: 6, quantity: 6 },
]

export default function Calculator() {
  const { user } = useAuth()
  const { result, calculate, saveCalculation, isSaving } = useSolarCalculator()

  const [appliances, setAppliances] = useState<ApplianceInput[]>(DEFAULT_APPLIANCES)
  const [sunHours, setSunHours] = useState(6)
  const [batteryDays, setBatteryDays] = useState(1)
  const [saveName, setSaveName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  const addAppliance = (preset?: typeof COMMON_APPLIANCES[0]) => {
    setAppliances(prev => [
      ...prev,
      preset
        ? { id: newId(), name: preset.name, watts: preset.watts, hoursPerDay: preset.hoursPerDay, quantity: 1 }
        : { id: newId(), name: '', watts: 0, hoursPerDay: 1, quantity: 1 },
    ])
  }

  const removeAppliance = (id: string) => {
    setAppliances(prev => prev.filter(a => a.id !== id))
  }

  const updateAppliance = (id: string, field: keyof ApplianceInput, value: string | number) => {
    setAppliances(prev =>
      prev.map(a => a.id === id ? { ...a, [field]: typeof value === 'string' ? value : Math.max(0, Number(value)) } : a)
    )
  }

  const handleCalculate = () => {
    const validAppliances = appliances.filter(a => a.watts > 0 && a.quantity > 0)
    if (validAppliances.length === 0) {
      toast.error('أضف على الأقل جهازاً واحداً للحساب')
      return
    }
    const input: SolarCalculationInput = { appliances: validAppliances, sunHoursPerDay: sunHours, batteryDays }
    calculate(input)
    window.scrollTo({ top: document.getElementById('result-section')?.offsetTop ?? 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!saveName.trim()) { toast.error('أدخل اسماً للحساب'); return }
    const validAppliances = appliances.filter(a => a.watts > 0 && a.quantity > 0)
    const input: SolarCalculationInput = { appliances: validAppliances, sunHoursPerDay: sunHours, batteryDays }
    const { error } = await saveCalculation(saveName, input)
    if (error) toast.error(error)
    else {
      toast.success('تم حفظ الحساب بنجاح')
      setSaveName('')
      setShowSaveForm(false)
    }
  }

  return (
    <div className="animate-fade-in">

      {/* الرأس */}
      <section className="bg-paper border-b border-sand-200">
        <div className="container-app px-5 sm:px-8 lg:px-12 py-16">
          <p className="eyebrow mb-4">— أداة مجانية</p>
          <h1 className="display-serif text-5xl lg:text-6xl text-ink mb-4">
            الحاسبة الشمسيّة
          </h1>
          <p className="text-sand-600 max-w-xl leading-relaxed">
            أدخل أجهزتك الكهربائية وساعات استخدامها، وسنحسب لك
            بدقّة عدد الألواح، سعة البطاريات، وحجم الإنفرتر المناسب لمنزلك.
          </p>
        </div>
      </section>

      <div className="container-app px-5 sm:px-8 lg:px-12 py-12">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* ===== قسم الإدخال ===== */}
          <div className="lg:col-span-3 space-y-8">

            {/* الأجهزة */}
            <div>
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-serif text-2xl text-ink">الأجهزة الكهربائيّة</h2>
                <p className="eyebrow text-sand-500">{appliances.length} جهاز</p>
              </div>

              <div className="border border-sand-200 rounded-lg overflow-hidden bg-ivory">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-paper">
                      <tr>
                        <th className="text-right px-4 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">الجهاز</th>
                        <th className="text-center px-2 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">واط</th>
                        <th className="text-center px-2 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">س/يوم</th>
                        <th className="text-center px-2 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">عدد</th>
                        <th className="text-center px-2 py-3 text-xs uppercase tracking-wider font-bold text-sand-600">Wh</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {appliances.map(app => {
                        const dailyWh = app.watts * app.hoursPerDay * app.quantity
                        return (
                          <tr key={app.id} className="border-t border-sand-100 hover:bg-paper/50 transition-colors">
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={app.name}
                                onChange={e => updateAppliance(app.id, 'name', e.target.value)}
                                placeholder="اسم الجهاز"
                                className="w-full bg-transparent border-0 focus:outline-none text-sm font-medium text-ink py-1"
                              />
                            </td>
                            <td className="px-1 py-2">
                              <input
                                type="number"
                                value={app.watts || ''}
                                onChange={e => updateAppliance(app.id, 'watts', e.target.value)}
                                min={0}
                                className="w-16 bg-transparent border-0 focus:outline-none focus:bg-paper rounded text-sm text-center text-ink nums py-1"
                              />
                            </td>
                            <td className="px-1 py-2">
                              <input
                                type="number"
                                value={app.hoursPerDay || ''}
                                onChange={e => updateAppliance(app.id, 'hoursPerDay', e.target.value)}
                                min={0} max={24}
                                className="w-16 bg-transparent border-0 focus:outline-none focus:bg-paper rounded text-sm text-center text-ink nums py-1"
                              />
                            </td>
                            <td className="px-1 py-2">
                              <input
                                type="number"
                                value={app.quantity || ''}
                                onChange={e => updateAppliance(app.id, 'quantity', e.target.value)}
                                min={1}
                                className="w-14 bg-transparent border-0 focus:outline-none focus:bg-paper rounded text-sm text-center text-ink nums py-1"
                              />
                            </td>
                            <td className="px-1 py-2 text-center text-sm font-bold text-sun-600 nums">
                              {dailyWh.toLocaleString('ar-SA')}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                onClick={() => removeAppliance(app.id)}
                                className="text-sand-400 hover:text-red-600 transition-colors text-lg"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* أزرار الإضافة */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => addAppliance()} className="text-sm font-medium text-ink border border-sand-300 hover:border-ink px-4 py-2 rounded-lg transition-colors">
                  + جهاز مخصّص
                </button>
                <div className="relative group">
                  <button className="text-sm font-medium text-ink border border-sand-300 hover:border-ink px-4 py-2 rounded-lg transition-colors">
                    من القائمة ▾
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-52 bg-ivory rounded-lg shadow-lift border border-sand-200 z-10 hidden group-hover:block overflow-hidden">
                    {COMMON_APPLIANCES.map(app => (
                      <button
                        key={app.name}
                        onClick={() => addAppliance(app)}
                        className="w-full text-right px-4 py-2.5 text-sm text-sand-700 hover:bg-paper transition-colors flex justify-between items-center"
                      >
                        <span>{app.name}</span>
                        <span className="text-xs text-sand-400 nums">{app.watts}W</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* الإعدادات */}
            <div>
              <h2 className="font-serif text-2xl text-ink mb-5">إعدادات المنظومة</h2>
              <div className="grid sm:grid-cols-2 gap-6 bg-ivory border border-sand-200 rounded-lg p-6">
                <div>
                  <label className="label-field">ساعات الشمس اليومية</label>
                  <input
                    type="range" min={4} max={8} step={0.5}
                    value={sunHours}
                    onChange={e => setSunHours(Number(e.target.value))}
                    className="w-full accent-sun-500 mb-2"
                  />
                  <div className="flex justify-between text-xs text-sand-500 nums">
                    <span>٤ س</span>
                    <span className="font-bold text-ink text-sm">{sunHours} ساعة</span>
                    <span>٨ س</span>
                  </div>
                  <p className="text-xs text-sand-500 mt-3">شمال سوريا: ٥–٦ · جنوبها: ٦–٧</p>
                </div>

                <div>
                  <label className="label-field">أيام الاستقلاليّة</label>
                  <input
                    type="range" min={1} max={5} step={1}
                    value={batteryDays}
                    onChange={e => setBatteryDays(Number(e.target.value))}
                    className="w-full accent-sun-500 mb-2"
                  />
                  <div className="flex justify-between text-xs text-sand-500 nums">
                    <span>١</span>
                    <span className="font-bold text-ink text-sm">{batteryDays} يوم</span>
                    <span>٥</span>
                  </div>
                  <p className="text-xs text-sand-500 mt-3">يُنصح بـ ١–٢ يوم منزلياً</p>
                </div>
              </div>
            </div>

            <button onClick={handleCalculate} className="btn-primary w-full py-4 text-base">
              احسب المنظومة المناسبة
            </button>
          </div>

          {/* ===== قسم النتائج ===== */}
          <div className="lg:col-span-2" id="result-section">
            {result ? (
              <div className="lg:sticky lg:top-28 bg-ivory border border-sand-200 rounded-lg p-7 animate-slide-up">
                <p className="eyebrow mb-3">— النتيجة</p>
                <h2 className="font-serif text-2xl text-ink mb-1">منظومة مقترحة</h2>
                <p className="text-xs text-sand-500 mb-6">تقديري — يُنصح بمراجعة متخصّص</p>

                <ul className="space-y-px bg-sand-200 border border-sand-200 rounded-lg overflow-hidden mb-6">
                  {[
                    { label: 'الاستهلاك اليومي',  value: `${result.totalDailyWh.toLocaleString('ar-SA')} Wh` },
                    { label: 'قدرة الألواح',      value: `${result.recommendedPanelWatts.toLocaleString('ar-SA')} W` },
                    { label: 'عدد الألواح (400W)', value: `${result.panelCount}` },
                    { label: 'سعة البطاريات',    value: `${result.batteryCapacityKwh} kWh` },
                    { label: 'حجم الإنفرتر',      value: `${result.inverterKva} kVA` },
                  ].map(item => (
                    <li key={item.label} className="bg-ivory flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-sand-600">{item.label}</span>
                      <span className="font-serif font-bold text-ink nums">{item.value}</span>
                    </li>
                  ))}
                </ul>

                {user && (
                  <div className="pt-5 border-t border-sand-200">
                    {showSaveForm ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="اسم للحساب..."
                          value={saveName}
                          onChange={e => setSaveName(e.target.value)}
                          className="input-field flex-1 text-sm py-2"
                        />
                        <button onClick={handleSave} disabled={isSaving} className="btn-primary text-sm py-2 px-4">
                          {isSaving ? '...' : 'حفظ'}
                        </button>
                        <button onClick={() => setShowSaveForm(false)} className="text-sand-400 hover:text-ink px-2">
                          ×
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowSaveForm(true)} className="btn-secondary w-full text-sm py-2.5">
                        احفظ هذا الحساب
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="lg:sticky lg:top-28 bg-ivory border border-dashed border-sand-300 rounded-lg p-10 text-center">
                <p className="eyebrow mb-4 text-sand-500">— النتيجة ستظهر هنا</p>
                <p className="font-serif text-xl text-sand-700 mb-2">في انتظار الحساب</p>
                <p className="text-sm text-sand-500">أضف أجهزتك ثم انقر <span className="font-bold text-ink">«احسب»</span></p>
              </div>
            )}
          </div>
        </div>

        {/* ملاحظة */}
        <div className="mt-12 p-5 bg-sun-50 border-r-4 border-sun-500 rounded text-sm text-sand-700 leading-relaxed">
          <strong className="text-ink">ملاحظة</strong> · الأرقام تقديريّة بناءً على ألواح ٤٠٠W وكفاءة منظومة ٨٠٪.
          يُنصح بمراجعة متخصّص لتصميم المنظومة الفعلي قبل الشراء.
        </div>
      </div>
    </div>
  )
}
