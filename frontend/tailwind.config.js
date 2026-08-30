/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm stone neutral — replaces the old cool gray "ink" for a softer,
        // more editorial paper-like base instead of a stark dashboard gray.
        ink: {
          50: '#F9F7F2',
          100: '#F0EBDF',
          200: '#E1D9C7',
          300: '#C7BC9F',
          400: '#A69874',
          500: '#83765A',
          600: '#645844',
          700: '#4A4132',
          800: '#312A20',
          900: '#1D1811',
          950: '#100D08',
        },
        // Brand accent — refined olive-lime. Less neon than the old #84CC16,
        // reads as premium/organic instead of gaming-green.
        energy: {
          50: '#F6FAE7',
          100: '#E9F3C4',
          200: '#D3E68C',
          300: '#B9D558',
          400: '#9FC232',
          500: '#83A31E',
          600: '#698019',
          700: '#526615',
          800: '#3F4F14',
          900: '#333F13',
        },
        // Supporting accent family — one warm (ember), two cool (indigo, teal),
        // one deep (plum) — used for card identity, chart categories, and to
        // keep the interface from reading as monochromatic.
        sky: { 50: '#EEF0FA', 400: '#7C87D9', 500: '#565FBE', 600: '#42499B' },
        coral: { 50: '#FBEEE5', 400: '#E2895A', 500: '#C96936', 600: '#A6521F' },
        violet: { 50: '#F6EEF3', 400: '#B473A0', 500: '#8F4F7E', 600: '#6E3B62' },
        aqua: { 50: '#E7F6F1', 400: '#49B79B', 500: '#28937A', 600: '#1E7361' },
      },
      fontFamily: {
        // Fraunces (editorial serif, optical-size aware) for headings/display
        // figures — pairs with Inter body copy for a premium-product feel
        // instead of the tech-dashboard look of two grotesk sans faces.
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
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
        '2xl': '1.375rem',
        '3xl': '1.875rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(29,24,17,0.05), 0 8px 24px -12px rgba(29,24,17,0.14)',
        lift: '0 2px 4px rgba(29,24,17,0.06), 0 24px 48px -20px rgba(29,24,17,0.24)',
        glow: '0 0 0 1px rgba(159,194,50,0.3), 0 12px 40px -12px rgba(131,163,30,0.5)',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.6s ease both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
        marquee: 'marquee 30s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
