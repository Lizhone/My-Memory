/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#2563EB',
        'dark-navy': '#102A56',
        'secondary-navy': '#173B73',
        'light-blue': '#F3F7FF',
        'very-light': '#F8FAFC',
        'border-color': '#E2E8F0',
      },
      borderRadius: {
        '10': '10px',
        '12': '12px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(16, 42, 86, 0.08)',
        'md': '0 4px 12px rgba(16, 42, 86, 0.12)',
        'lg': '0 8px 16px rgba(16, 42, 86, 0.15)',
      },
    },
  },
  plugins: [],
}
