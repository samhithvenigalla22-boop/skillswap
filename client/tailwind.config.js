/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF0FF',
          100: '#E0E3FF',
          200: '#C7CCFE',
          300: '#A4ACFD',
          400: '#7F85FA',
          500: '#5145CD', // Deep Indigo specified in prompt
          600: '#4334BF',
          700: '#382B9F',
          800: '#2E2480',
          900: '#272068',
        },
        secondary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6', // Violet specified in prompt
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        background: '#F8FAFC',
        textMain: '#172033',
        darkBg: '#0F172A',
        darkCard: '#1E293B',
        darkBorder: '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -5px rgba(81, 69, 205, 0.1), 0 8px 10px -6px rgba(81, 69, 205, 0.05)',
      }
    },
  },
  plugins: [],
}
