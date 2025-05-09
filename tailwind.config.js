// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#E63946",      // bold red
        offwhite: "#F8F9FA",     // light off-white
        neon: "rgb(0, 255, 255)"  // cyan neon accent
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],    // Inter for body copy
        display: ["Times New Roman", "sans-serif"] // Orbitron for titles
      }
    }
  },
  plugins: []
};