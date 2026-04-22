/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          50:  '#f6f7f2',
          100: '#e9ece0',
          200: '#d4dac3',
          300: '#b5bf9e',
          400: '#95a278',
          500: '#788760',
          600: '#5d6b4a',
          700: '#4a553b',
          800: '#3d4532',
          900: '#343b2c',
        },
        cream: '#f8f4ef',
        blush: '#e8d5c4',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%':       { transform: 'rotate(2deg)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        sway:   'sway 4s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s ease forwards',
      },
    },
  },
  plugins: [],
}