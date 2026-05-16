import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
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

export default config;
