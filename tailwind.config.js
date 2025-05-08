/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',    // bold red
        offwhite: '#F8F9FA',   // light off‑white
        neon: 'rgb(0, 255, 255)', // cyan neon accent
      },
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(230,57,70,0.7)' },
          '50%':    { boxShadow: '0 0 16px rgba(230,57,70,1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};