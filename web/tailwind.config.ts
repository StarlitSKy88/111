import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#fff5f2', 500: '#ff5a1f', 600: '#e53e00' },
      },
    },
  },
  plugins: [],
};
export default config;
