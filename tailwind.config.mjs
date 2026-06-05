/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  safelist: ['sr-only'],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {}
  },
  plugins: []
};
