// مكوّن الشعار الموحّد — يستخدم sun.svg من مجلد public

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  withText?: boolean
  variant?: 'default' | 'light'
}

export default function Logo({ size = 'md', withText = true, variant = 'default' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 'w-8 h-8',  title: 'text-base', subtitle: 'text-[10px]' },
    md: { icon: 'w-10 h-10', title: 'text-lg',   subtitle: 'text-xs' },
    lg: { icon: 'w-16 h-16', title: 'text-2xl',  subtitle: 'text-sm' },
  }
  const s = sizeMap[size]

  return (
    <div className="flex items-center gap-3 group">
      {/* شعار الشمس من sun.svg */}
      <img
        src="/sun.svg"
        alt="شمس سوريا"
        className={`${s.icon} object-contain transition-transform duration-500 group-hover:rotate-45 flex-shrink-0`}
      />

      {/* النص — تحريري بحرف ضيق */}
      {withText && (
        <div className="leading-none">
          <span
            className={`font-serif font-bold ${s.title} block tracking-editorial ${
              variant === 'light' ? 'text-ivory' : 'text-ink'
            }`}
          >
            شمس سوريا
          </span>
          <span
            className={`${s.subtitle} uppercase tracking-widest font-medium mt-1 inline-block ${
              variant === 'light' ? 'text-sand-300' : 'text-sand-500'
            }`}
            style={{ letterSpacing: '0.18em' }}
          >
            Shams Syria · Solar
          </span>
        </div>
      )}
    </div>
  )
}
