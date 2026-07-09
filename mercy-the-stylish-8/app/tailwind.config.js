/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAFAF8",
        blush: "#F5E6EA",
        rose: { DEFAULT: "#B83256", dark: "#962A47", light: "#FDF2F5" },
        gold: "#C9A227",
        plum: "#1A1A1A",
        ink: "#2D2D2D",
        muted: "#6B6B6B",
        border: "#E8E8E8"
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"]
      },
      borderRadius: {
        brand: "12px"
      },
      boxShadow: {
        brand: "0 1px 3px rgba(0,0,0,0.06)",
        card: "0 4px 24px rgba(0,0,0,0.06)",
        hover: "0 8px 32px rgba(0,0,0,0.1)"
      },
      maxWidth: {
        shop: "1280px"
      }
    }
  },
  plugins: []
};
