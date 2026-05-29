/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#080706',
          900: '#0E0C0A',
          800: '#15120F',
          700: '#1C1916',
          600: '#26221E',
          500: '#33302B',
        },
        beige: {
          50: '#FBF7F0',
          100: '#F2EADB',
          200: '#E8DCC2',
          300: '#D9C7A7',
          400: '#C7B188',
          500: '#B89968',
          600: '#9C8055',
          700: '#7A6442',
        },
        gold: {
          DEFAULT: '#B89968',
          soft: '#D9C7A7',
          deep: '#7A6442',
        },
        cyan: {
          medical: '#6FB3B8',
          deep: '#3E7D80',
        },
        crimson: {
          DEFAULT: '#C8553D',
          deep: '#8E3A28',
        },
        slate: {
          mute: '#5C6470',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        hud: '0 0 0 1px rgba(217, 199, 167, 0.08), 0 12px 40px -10px rgba(0,0,0,0.55)',
        glow: '0 0 24px rgba(217, 199, 167, 0.15)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.85 0 0 0 0 0.78 0 0 0 0 0.65 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'radial-fade': 'radial-gradient(ellipse at top, rgba(217,199,167,0.10), transparent 60%)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        pulseRing: 'pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
