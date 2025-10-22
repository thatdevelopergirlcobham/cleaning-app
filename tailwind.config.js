/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: '#2e7d32',
        secondary: '#2563EB',
        accent: '#FACC15',
        neutral: '#F9FAFB',
        text: '#1E293B',
        error: '#DC2626',
        success: '#22C55E',
        info: '#3B82F6',
        border: '#E5E7EB',
        background: '#FFFFFF',
        foreground: '#1E293B',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
