/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
     "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

safelist: [
  'border-blue-500',
  'text-blue-600',
  'bg-blue-50'
]