/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages-ui/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f8',
          500: '#0e8ee9',
          600: '#0270c5',
          700: '#03599e',
          800: '#074c83',
          900: '#0c406e',
          950: '#082949',
        },
        accent: {
          50: '#fff5f0',
          100: '#ffe8db',
          200: '#ffd0b7',
          300: '#ffac84',
          400: '#ff7f4d',
          500: '#ff571f',
          600: '#f03d0a',
          700: '#c72e07',
          800: '#9e250b',
          900: '#80210d',
          950: '#460d03',
        }
      },
    },
  },
  plugins: [],
};
