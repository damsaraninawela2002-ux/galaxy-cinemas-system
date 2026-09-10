/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand upgraded to Netflix/Cinema red palette
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#E50914', // Signature Cinema Red
          700: '#dc2626',
          800: '#b91c1c',
          900: '#991b1b',
          950: '#450a0a',
        },
        cinema: {
          dark: '#08090E',       // Ultra deep charcoal black background
          darker: '#050608',
          card: '#10131E',       // Primary card surface
          cardHover: '#161A29',  // Elevated card hover
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          red: '#E50914',
          redHover: '#FF1E27',
          gold: '#F59E0B',
          muted: '#94A3B8',
          text: '#F8FAFC',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      boxShadow: {
        'soft': '0 4px 25px -2px rgba(0, 0, 0, 0.4)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
        'glow': '0 0 25px -4px rgba(229, 9, 20, 0.35)',
        'glow-red': '0 0 25px -4px rgba(229, 9, 20, 0.45)',
        'glow-gold': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.35)',
      },
      backgroundImage: {
        'cinema-gradient': 'linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(16,19,30,0) 100%)',
        'cinema-radial': 'radial-gradient(ellipse at top, rgba(229,9,20,0.12), transparent 70%)',
      }
    },
  },
  plugins: [],
}
