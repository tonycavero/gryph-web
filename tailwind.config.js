/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        canvas: '#FBFBFB',
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#0B0F17',
        },
      },
      boxShadow: {
        'figma-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'figma': '0 12px 32px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'figma-lg': '0 24px 64px -12px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.04)',
        'card-deck': '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
