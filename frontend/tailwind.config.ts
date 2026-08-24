import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep navy primary + single warm accent (modern European fintech).
        navy: {
          50: "#f0f4f9",
          100: "#d9e2f0",
          600: "#1e3a5f",
          700: "#162c48",
          800: "#0f2035",
          900: "#0a1626",
        },
        accent: {
          400: "#5ac4a8",
          500: "#2fa987",
          600: "#238a6d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
