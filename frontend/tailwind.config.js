/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#08090C',
          secondary: '#0D1117',
          elevated: '#111820',
        },
        surface: {
          DEFAULT: '#111820',
          glass: 'rgba(255, 255, 255, 0.04)',
          'glass-elevated': 'rgba(255, 255, 255, 0.065)',
          'glass-hover': 'rgba(255, 255, 255, 0.085)',
          'glass-active': 'rgba(255, 255, 255, 0.12)',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#9AA4B2',
          muted: '#7A889B',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.09)',
          bright: 'rgba(255, 255, 255, 0.22)',
          subtle: 'rgba(255, 255, 255, 0.06)',
        },
        protected: {
          DEFAULT: '#00FF9D',
          glow: 'rgba(0, 255, 157, 0.25)',
          subtle: 'rgba(0, 255, 157, 0.12)',
          border: 'rgba(0, 255, 157, 0.35)',
        },
        information: {
          DEFAULT: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.25)',
          subtle: 'rgba(0, 217, 255, 0.12)',
          border: 'rgba(0, 217, 255, 0.35)',
        },
        suspicious: {
          DEFAULT: '#FFB020',
          glow: 'rgba(255, 176, 32, 0.25)',
          subtle: 'rgba(255, 176, 32, 0.12)',
          border: 'rgba(255, 176, 32, 0.35)',
        },
        critical: {
          DEFAULT: '#FF465A',
          glow: 'rgba(255, 70, 90, 0.25)',
          subtle: 'rgba(255, 70, 90, 0.12)',
          border: 'rgba(255, 70, 90, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.55)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14)',
        'protected-glow': '0 0 25px rgba(0, 255, 157, 0.3)',
        'info-glow': '0 0 25px rgba(0, 217, 255, 0.3)',
        'critical-glow': '0 0 25px rgba(255, 77, 109, 0.35)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
      },
      keyframes: {
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
      },
    },
  },
  plugins: [],
};
