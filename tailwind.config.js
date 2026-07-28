/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ===== Warm Editorial Palette (مستوحى من open-design / warm-editorial + kami) =====

        // الورق والأسطح
        paper:  '#FAF7F2', // خلفية الصفحة (parchment)
        ivory:  '#FFFDF8', // أسطح البطاقات
        ink:    '#1C1A17', // النص الأساسي (near-black warm)
        muted:  '#6B6A64', // النصوص الثانوية

        // أصفر/برتقالي شمسي (terracotta + amber) — نُبقي اسم sun للحفاظ على التوافق
        sun: {
          50:  '#FBF1EB',
          100: '#F4E4DC',
          200: '#EBC8B5',
          300: '#DEA68A',
          400: '#D17F5C',
          500: '#C0512F', // primary terracotta
          600: '#A24327',
          700: '#82371F',
          800: '#5F2917',
          900: '#3D1B10',
        },

        // amber دافئ — مكمل
        sunset: {
          50:  '#FBF4E8',
          100: '#F6E5C5',
          200: '#EFCB8C',
          300: '#E5AE57',
          400: '#D89638',
          500: '#B97C24',
          600: '#94621C',
        },

        // أخضر الغابة (forest) — secondary
        leaf: {
          50:  '#EEF2EF',
          100: '#DCE7E2',
          200: '#B5CDC4',
          300: '#84AC9E',
          400: '#558877',
          500: '#2F5B4F',
          600: '#264A40',
          700: '#1E3A33',
        },

        // أزرق غامق / حبر — accent بارد للتوازن
        sky2: {
          50:  '#EDF1F6',
          100: '#D9E1EC',
          200: '#B3C4D9',
          300: '#85A1BF',
          400: '#577FA6',
          500: '#365F8A',
          600: '#274970',
        },

        // الرمال — رمادي دافئ (yellow-brown undertone)
        sand: {
          50:  '#F7F4EE',
          100: '#EFEAE0',
          200: '#E0D9CB',
          300: '#C4BCA9',
          400: '#9A917F',
          500: '#6B6A64',
          600: '#504E49',
          700: '#3D3D3A',
          800: '#252523',
          900: '#1C1A17',
        },
      },

      fontFamily: {
        // النصوص — Tajawal خفيف وحديث
        tajawal: ['Tajawal', 'sans-serif'],
        // العناوين الكبيرة — Cairo + Amiri للطابع التحريري
        cairo:   ['Cairo', 'sans-serif'],
        serif:   ['Amiri', 'Markazi Text', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      boxShadow: {
        // فقط: ring (إطار) و whisper (همس)
        'ring-ink':    '0 0 0 1px rgba(28, 26, 23, 0.08)',
        'ring-accent': '0 0 0 1px rgba(192, 81, 47, 0.40)',
        'whisper':     '0 4px 24px rgba(28, 26, 23, 0.05)',
        'lift':        '0 12px 32px -8px rgba(28, 26, 23, 0.10)',
      },

      backgroundImage: {
        // تدرّج مُضبَط (للأقسام البطل فقط)
        'paper-warm': 'radial-gradient(ellipse 800px 400px at 70% -10%, #F4E4DC 0%, transparent 60%), radial-gradient(ellipse 600px 300px at 0% 100%, #EEF2EF 0%, transparent 50%), #FAF7F2',
      },

      letterSpacing: {
        'tightest': '-0.04em',
        'editorial': '-0.02em',
      },

      animation: {
        'fade-in':  'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
}
