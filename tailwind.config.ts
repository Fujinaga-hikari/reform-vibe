import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f9",
          100: "#d6dff0",
          200: "#aec0e0",
          300: "#7d97c7",
          400: "#4f6ead",
          500: "#2f4f8f",
          600: "#1f3a73",
          700: "#162b57",
          800: "#0f1f3f",
          900: "#0a1530",
          950: "#060d1f",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Noto Sans JP", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        floatDot: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "50%": { transform: "translateY(-6px)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "float-dot": "floatDot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
