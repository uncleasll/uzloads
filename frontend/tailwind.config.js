/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF4FF',
          100: '#DBE8FF',
          200: '#BAD1FF',
          300: '#8AB4FF',
          400: '#528AFF',
          500: '#0052FF',
          600: '#0044D9',
          700: '#0036B3',
          800: '#002A8C',
          900: '#001E66',
        },
        neutral: {
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
