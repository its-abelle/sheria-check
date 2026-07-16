/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d97706",
          600: "#b45309",
        },
      },
      keyframes: {
        "scale-tilt": {
          "0%": { transform: "rotate(-12deg)" },
          "25%": { transform: "rotate(10deg)" },
          "40%": { transform: "rotate(-6deg)" },
          "55%": { transform: "rotate(4deg)" },
          "70%": { transform: "rotate(-2deg)" },
          "85%": { transform: "rotate(1deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "scale-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 6px rgba(251, 191, 36, 0.3))" },
          "50%": { filter: "drop-shadow(0 0 16px rgba(251, 191, 36, 0.6))" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scales-balance": "scale-tilt 1.6s ease-out forwards",
        "scales-glow": "scale-glow 3s ease-in-out infinite 1.6s",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
