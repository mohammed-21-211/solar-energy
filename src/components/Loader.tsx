// مكوّن تحميل قابل لإعادة الاستخدام
interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullPage?: boolean
}

export default function Loader({ size = 'md', text, fullPage = false }: LoaderProps) {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeMap[size]} animate-spin rounded-full border-2 border-sand-200 border-t-sun-500`} />
      {text && <p className="text-sand-500 font-medium text-sm">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper/80 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-16">{spinner}</div>
}
