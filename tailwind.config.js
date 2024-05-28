/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        Base:'#232136',
        Surface: '#2a273f',
        Overlay: '#393552',
        Muted: '#6e6a86',
        Subtle: '#908caa',
        Text: '#e0def4',
        Pine: '#3e8fb0',
        Rose: '#ea9a97',
        Iris: '#c4a7e7',
        HighLightLow: '#2a283e',
      }
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
} 

