/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        flux: {
          // Legacy names — valores actualizados al nuevo sistema de diseño
          black:  '#0E0F13',
          gray:   '#888A93',
          light:  '#F0F0F4',
          border: '#e5e5e5',
          green:  '#0CAE73',
          red:    '#E5484D',
          blue:   '#0EA5E9',
          // Nuevos tokens del sistema de diseño
          bg:           '#E7E8EE',
          card:         '#FFFFFF',
          ink:          '#0E0F13',
          'ink-2':      '#42434A',
          'gray-2':     '#B0B2BB',
          fill:         '#F0F0F4',
          accent:       '#0CAE73',
          'accent-ink': '#0A8F60',
          'accent-soft':'#E6F6EF',
          mint:         '#EAF7F1',
          amber:        '#E08600',
          coral:        '#E5484D',
        }
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        flux: '0 8px 22px -10px rgba(14,15,19,.18), 0 1px 2px rgba(14,15,19,.04)',
        hero: '0 18px 36px -16px rgba(12,150,120,.7)',
        fab:  '0 16px 32px -10px rgba(12,150,120,.7)',
      }
    }
  },
  plugins: []
}
