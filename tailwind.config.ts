import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        warm: {
          bg: "#FBFBFA",
          card: "#FFFFFF",
          surface: "#F4F4F0",
          border: "#E7E5E4",
        },
        sage: {
          50: "#F2F8F5",
          100: "#D8F3DC",
          200: "#B7E4C7",
          500: "#40916C",
          600: "#2D6A4F",
          700: "#1B4332",
          800: "#081C15",
        },
        amber: {
          pending: "#D97706",
          pendingBg: "#FFFBEB",
          pendingBorder: "#FDE68A",
        },
        sos: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
      },
      fontSize: {
        "senior-base": ["1.125rem", { lineHeight: "1.75rem" }], // 18px base
        "senior-lg": ["1.25rem", { lineHeight: "1.875rem" }],   // 20px
        "senior-xl": ["1.5rem", { lineHeight: "2.125rem" }],    // 24px
        "senior-2xl": ["1.875rem", { lineHeight: "2.375rem" }], // 30px
        "senior-3xl": ["2.25rem", { lineHeight: "2.75rem" }],   // 36px
        "senior-4xl": ["3rem", { lineHeight: "1.15" }],         // 48px
      },
      minHeight: {
        tap: "48px",
        "tap-lg": "56px",
        "tap-xl": "64px",
      },
      minWidth: {
        tap: "48px",
        "tap-lg": "56px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ripple": "ripple 2s linear infinite",
        "bounce-subtle": "bounce-subtle 2s infinite",
      },
      keyframes: {
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        ripple: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
