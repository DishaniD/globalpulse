/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          50: '#F5F5F0',
          100: '#E8E8E0',
          200: '#C8C8B8',
          300: '#A0A090',
          400: '#707060',
          500: '#4A4A38',
          600: '#2E2E20',
          700: '#1A1A10',
          800: '#0D0D08',
          900: '#050503',
        },
        pulse: {
          DEFAULT: '#C8102E',
          light: '#E8314A',
          dark: '#8B0B20',
        },
        gold: {
          DEFAULT: '#D4A017',
          light: '#F0C040',
          dark: '#9A7210',
        },
        cream: '#FAF8F2',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        ticker: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(-100%)' } },
      },
    },
  },
  plugins: [],
}
