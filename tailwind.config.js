/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        obsidian: '#09090B',
        ink: '#0C0C0F',
        graphite: '#121216',
        'graphite-2': '#17171C',
        gold: '#D4AF37',
        'gold-light': '#F5D061',
        'gold-deep': '#A8842A',
        cream: '#F5F1E8',
        muted: '#9B9A94',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        shell: '1240px',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      letterSpacing: {
        kicker: '0.28em',
      },
    },
  },
  plugins: [],
};
