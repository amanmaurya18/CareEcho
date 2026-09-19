import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--c-bg-rgb) / <alpha-value>)",
        card: "rgb(var(--c-card-rgb) / <alpha-value>)",
        line: "rgb(var(--c-line-rgb) / <alpha-value>)",
        ink: "rgb(var(--c-ink-rgb) / <alpha-value>)",
        soft: "rgb(var(--c-soft-rgb) / <alpha-value>)",
        sage: "rgb(var(--c-sage-rgb) / <alpha-value>)",
        amberw: "rgb(var(--c-amber-rgb) / <alpha-value>)",
        danger: "rgb(var(--c-danger-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        lift: "0 4px 16px -2px rgb(0 0 0 / 0.10)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        fadeUp: "fadeUp 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
