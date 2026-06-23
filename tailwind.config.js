/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        flux: {
          black: '#111111',
          gray: '#666666',
          light: '#f5f5f5',
          border: '#e5e5e5',
          green: '#22c55e',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
