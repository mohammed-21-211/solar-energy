import { useState } from 'react'
import { supabase, ORGANIZATION_ID } from '../supabase/client'
import type { ApplianceInput, SolarCalculationInput, SolarCalculationResult, SavedCalculation } from '../types'
import { useAuth } from '../context/AuthContext'

// ======================================================
// Hook حاسبة الطاقة الشمسية
// يحسب المنظومة المناسبة بناءً على استهلاك العميل
// ======================================================

// الأجهزة الشائعة في المنازل السورية مع استهلاكها الافتراضي
export const COMMON_APPLIANCES: Omit<ApplianceInput, 'id' | 'quantity'>[] = [
  { name: 'تلفزيون LED',          watts: 80,   hoursPerDay: 6 },
  { name: 'غسالة ملابس',          watts: 500,  hoursPerDay: 1 },
  { name: 'ثلاجة',               watts: 150,  hoursPerDay: 8 },
  { name: 'مكيف هواء (1.5 حصان)', watts: 1500, hoursPerDay: 6 },
  { name: 'مروحة سقف',            watts: 75,   hoursPerDay: 8 },
  { name: 'إضاءة LED (لمبة)',      watts: 12,   hoursPerDay: 6 },
  { name: 'شاحن هاتف',            watts: 10,   hoursPerDay: 4 },
  { name: 'جهاز كمبيوتر',         watts: 200,  hoursPerDay: 6 },
  { name: 'مضخة مياه',            watts: 750,  hoursPerDay: 2 },
  { name: 'ميكروويف',             watts: 1000, hoursPerDay: 0.5 },
]

// حساب المنظومة الشمسية المناسبة
function calculateSolarSystem(input: SolarCalculationInput): SolarCalculationResult {
  // الخطوة 1: حساب إجمالي الاستهلاك اليومي بالواط/ساعة
  const totalDailyWh = input.appliances.reduce((sum, appliance) => {
    return sum + appliance.watts * appliance.hoursPerDay * appliance.quantity
  }, 0)

  // الخطوة 2: حساب القدرة الإجمالية للألواح
  // نضيف 25% هامش خسارة لضمان الكفاءة الكافية
  const systemLossFactor = 1.25
  const requiredPanelWh = totalDailyWh * systemLossFactor
  const recommendedPanelWatts = Math.ceil(requiredPanelWh / input.sunHoursPerDay)

  // الخطوة 3: عدد الألواح (بافتراض لوح بقدرة 400W)
  const STANDARD_PANEL_WATTS = 400
  const panelCount = Math.ceil(recommendedPanelWatts / STANDARD_PANEL_WATTS)

  // الخطوة 4: سعة البطاريات
  // نحتاج تخزين استهلاك عدد أيام الاستقلالية مع عمق تفريغ 80%
  const batteryDepthOfDischarge = 0.8
  const batteryCapacityWh = (totalDailyWh * input.batteryDays) / batteryDepthOfDischarge
  const batteryCapacityKwh = parseFloat((batteryCapacityWh / 1000).toFixed(1))

  // الخطوة 5: حجم الإنفرتر
  // يجب أن يتحمل أعلى حمل لحظي مضروباً بعامل أمان 1.25
  const peakLoad = input.appliances.reduce((max, appliance) => {
    return max + appliance.watts * appliance.quantity
  }, 0)
  const inverterKva = parseFloat(((peakLoad * 1.25) / 1000).toFixed(1))

  return {
    totalDailyWh: Math.round(totalDailyWh),
    recommendedPanelWatts,
    panelCount,
    batteryCapacityKwh,
    inverterKva,
  }
}

export function useSolarCalculator() {
  const { user } = useAuth()
  const [result, setResult] = useState<SolarCalculationResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)

  // تنفيذ الحساب
  const calculate = (input: SolarCalculationInput): SolarCalculationResult => {
    const calcResult = calculateSolarSystem(input)
    setResult(calcResult)
    return calcResult
  }

  // حفظ الحساب في Supabase
  const saveCalculation = async (name: string, input: SolarCalculationInput) => {
    if (!user || !result) return { error: 'يجب تسجيل الدخول لحفظ الحسابات' }
    setIsSaving(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('saved_calculations') as any).insert({
      organization_id: ORGANIZATION_ID,
      user_id: user.id,
      name,
      input_data: input,
      result_data: result,
    })

    setIsSaving(false)
    if (error) return { error: error.message }
    await fetchSavedCalculations()
    return { error: null }
  }

  // جلب الحسابات المحفوظة
  const fetchSavedCalculations = async () => {
    if (!user) return
    setIsLoadingSaved(true)

    const { data, error } = await supabase
      .from('saved_calculations')
      .select('*')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setSavedCalculations((data as unknown as SavedCalculation[]) ?? [])
    setIsLoadingSaved(false)
  }

  // حذف حساب محفوظ
  const deleteCalculation = async (id: string) => {
    const { error } = await supabase.from('saved_calculations').delete().eq('id', id)
    if (!error) setSavedCalculations(prev => prev.filter(c => c.id !== id))
    return { error: error?.message ?? null }
  }

  return {
    result,
    calculate,
    saveCalculation,
    isSaving,
    savedCalculations,
    isLoadingSaved,
    fetchSavedCalculations,
    deleteCalculation,
  }
}
