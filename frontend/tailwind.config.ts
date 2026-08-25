import type { Config } from "tailwindcss";

/**
 * Veyra design tokens — premium European fintech.
 * Ink navy ground, mint accent, electric secondary, cool neutrals.
 * Accents are used sparingly (see components).
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B172A",
          900: "#0B172A",
          800: "#12213A",
          700: "#1B2C49",
          600: "#283A5C",
        },
        mint: {
          DEFAULT: "#21C7A8",
          50: "#EAFBF6",
          100: "#CFF5EB",
          400: "#3DD6BA",
          500: "#21C7A8",
          600: "#12A98D",
          700: "#0E8871",
        },
        electric: {
          DEFAULT: "#6C63FF",
          50: "#EEEDFF",
          100: "#E0DEFF",
          400: "#8A83FF",
          500: "#6C63FF",
          600: "#564CE6",
        },
        canvas: "#F6F8FA",
        muted: "#64748B",
        // App-flow (dark product experience) tokens.
        midnight: "#071426",
        appsurface: "#0F2035",
        appborder: "#26364B",
        appselect: "#0E3A38",
        appmuted: "#94A3B8",
        appwhite: "#F8FAFC",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.4rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,23,42,0.04), 0 18px 40px -24px rgba(11,23,42,0.18)",
        lift: "0 2px 6px rgba(11,23,42,0.06), 0 30px 60px -28px rgba(11,23,42,0.28)",
        glow: "0 0 0 1px rgba(33,199,168,0.35), 0 12px 40px -12px rgba(33,199,168,0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-1000" },
        },
        "pulse-node": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.6s ease both",
        "dash-flow": "dash-flow 22s linear infinite",
        "pulse-node": "pulse-node 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
