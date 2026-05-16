/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        coral: '#FF6340',
        background: '#FAFAF8',
        foreground: '#1A1A2E',
      },
    },
  },
  plugins: [],
};
