/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#F5F6F7',
          100: '#E9EBEE',
          200: '#D2D6DC',
          300: '#AEB4BD',
          400: '#828A96',
          500: '#626A76',
          600: '#4D545F',
          700: '#3F444D',
          800: '#262A31',
          900: '#16181D',
          950: '#0C0D10',
        },
        energy: {
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        // Accent family — same hues already used in Dashboard analytics, now also
        // used for card identity/icon treatments so the Dashboard reads as more
        // than one color without introducing a second, unrelated palette.
        sky: { 50: '#EAF3FC', 400: '#5598E7', 500: '#2a78d6', 600: '#1c5cab' },
        coral: { 50: '#FDEEE7', 400: '#F0916A', 500: '#eb6834', 600: '#c9531f' },
        violet: { 50: '#EFEDFA', 400: '#8172D6', 500: '#4a3aa7', 600: '#392C82' },
        aqua: { 50: '#E6F6F0', 400: '#3FC694', 500: '#1baf7a', 600: '#158F63' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }],
        '5xl': ['3.25rem', { lineHeight: '3.5rem' }],
        '6xl': ['4rem', { lineHeight: '1.05' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,18,21,0.04), 0 8px 24px -12px rgba(16,18,21,0.12)',
        lift: '0 2px 4px rgba(16,18,21,0.05), 0 24px 48px -20px rgba(16,18,21,0.22)',
        glow: '0 0 0 1px rgba(163,230,53,0.25), 0 12px 40px -12px rgba(132,204,22,0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.6s ease both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
