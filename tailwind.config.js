/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neumorphic': '8px 8px 24px #181A20, -8px -8px 24px #23272F',
        'neumorphic-inset': 'inset 4px 4px 12px #181A20, inset -4px -4px 12px #23272F',
        'neumorphic-hover': '12px 12px 32px #181A20, -12px -12px 32px #23272F',
        'neumorphic-pressed': 'inset 2px 2px 8px #181A20, inset -2px -2px 8px #23272F',
      },
      colors: {
        'synth-surface': '#23272F',
        'synth-text': '#F3F4F6',
        'synth-primary': '#6366F1',
        'synth-secondary': '#5F4BFF',
        // Add more custom colors as needed
      },
    },
  },
  plugins: [],
}
