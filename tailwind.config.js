/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          obsidian: '#08120e',
          dark: '#0c1a14',
          surface: 'rgba(16, 33, 26, 0.65)',
          cream: '#F4EEDD',
          creamMuted: 'rgba(244, 238, 221, 0.75)',
          emeraldGlow: '#10B981',
          mint: '#34D399',
          border: 'rgba(244, 238, 221, 0.12)',
          borderFocus: 'rgba(52, 211, 153, 0.45)'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.25)',
        'glow-cream': '0 0 30px -4px rgba(244, 238, 221, 0.2)',
        'card-glass': '0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)'
      }
    },
  },
  plugins: [],
}
