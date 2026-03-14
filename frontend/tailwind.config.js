/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D2137',
          50: '#E8EFF6',
          100: '#C6D5E5',
          200: '#8AADC8',
          300: '#4D84AB',
          400: '#1A5A8A',
          500: '#0D2137',
          600: '#0A1B2E',
          700: '#071424',
          800: '#040E1A',
          900: '#020810',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F5B700',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5B700',
          600: '#D97706',
          700: '#B45309',
          foreground: '#0D2137',
        },
        surface: '#F7F9FC',
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        actionbg: '#EDF3FF',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(13, 33, 55, 0.08), 0 1px 2px -1px rgba(13, 33, 55, 0.06)',
        'card-md': '0 4px 6px -1px rgba(13, 33, 55, 0.08), 0 2px 4px -2px rgba(13, 33, 55, 0.05)',
      },
    },
  },
  plugins: [],
}
