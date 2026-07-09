/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support toggling dark mode or default to dark
  theme: {
    extend: {
      colors: {
        azure: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bce0fe',
          300: '#83c8fd',
          400: '#43a9fc',
          500: '#198bf5',
          600: '#0b6dd1',
          700: '#0b56a9',
          800: '#0e4a8b',
          900: '#113e72',
          950: '#0b274c',
        },
      },
    },
  },
  plugins: [],
}
