/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'oklch(0.17 0 0)',
          elevated: 'oklch(0.22 0 0)',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        glass: {
          DEFAULT: 'oklch(1 0 0 / 5%)',
          border: 'oklch(1 0 0 / 8%)',
        },
      },
      animation: {
        'shimmer-slide': 'shimmer-slide var(--speed, 3s) linear infinite',
        'spin-around': 'spin-around var(--speed, 3s) linear infinite',
        'pulse-ripple': 'pulse-ripple var(--duration, 1.5s) ease-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'shimmer-slide': {
          to: { transform: 'translate(100cqw)' },
        },
        'spin-around': {
          '0%': { transform: 'translateZ(0) rotate(0)' },
          '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
          '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        'pulse-ripple': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function addUtils({ addUtilities }) {
      addUtilities({
        '.border-border': { borderColor: 'hsl(var(--border))' },
        '.bg-background': { backgroundColor: 'hsl(var(--background))' },
        '.bg-card': { backgroundColor: 'hsl(var(--card))' },
        '.bg-muted': { backgroundColor: 'hsl(var(--muted))' },
        '.bg-primary': { backgroundColor: 'hsl(var(--primary))' },
        '.text-foreground': { color: 'hsl(var(--foreground))' },
        '.text-muted-foreground': { color: 'hsl(var(--muted-foreground))' },
        '.text-primary': { color: 'hsl(var(--primary))' },
        '.text-primary-foreground': { color: 'hsl(var(--primary-foreground))' },
        '.text-destructive': { color: 'hsl(var(--destructive))' },
        '.border-input': { borderColor: 'hsl(var(--input))' },
        '.border-destructive': { borderColor: 'hsl(var(--destructive))' },
        '.ring-ring': { '--tw-ring-color': 'hsl(var(--ring))' },
    
      })
    },
  ],
}
