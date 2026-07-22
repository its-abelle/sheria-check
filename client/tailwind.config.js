/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F5EDE4",
          100: "#E2CBB8",
          200: "#C59B7E",
          300: "#A87A5E",
          400: "#8B5A42",
          500: "#6B3A2A",
          600: "#562F22",
          700: "#422418",
          800: "#2E1A11",
          900: "#1B100A",
        },
        caution: {
          50: "#FFF8E1",
          100: "#FFECB3",
          200: "#FFE082",
          300: "#FFD54F",
          400: "#FFCA28",
          500: "#D4920A",
          600: "#B8860B",
          700: "#8B6508",
        },
        surface: "#FAFAF8",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Source Sans 3", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
