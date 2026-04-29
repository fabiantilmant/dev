/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terra:  { DEFAULT: '#C4612C', dark: '#A84E22', light: '#F0E8DF', xlight: '#FBF6EF' },
        sage:   { DEFAULT: '#6B8C72', light: '#E2EDE4' },
        cream:  '#FBF6EF',
        brown:  { DEFAULT: '#2C1F17', light: '#9E8A7C' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans:  ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    }
  },
  plugins: []
}
