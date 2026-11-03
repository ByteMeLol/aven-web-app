/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aven: {
          ink: '#18342d',
          green: '#168365',
          sage: '#e4f1e8',
          paper: '#f5f7f2',
          muted: '#6f7e77',
          line: '#dfe6dd'
        }
      },
      boxShadow: {
        soft: '0 8px 28px rgba(24, 52, 45, 0.05)'
      }
    }
  },
  plugins: [],
}
