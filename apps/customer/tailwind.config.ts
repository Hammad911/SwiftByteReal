import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0D0B08",
        surface: "#161410",
        elevated: "#1F1C18",
        gold: {
          DEFAULT: "#F5A623",
          50:  "#FDF1DC",
          100: "#FBE2B5",
          200: "#F8CC7A",
          300: "#F5B53D",
          400: "#F5A623",
          500: "#E8891A",
          600: "#C76D11",
          700: "#9C540C",
        },
        flame: {
          DEFAULT: "#E8372A",
          50:  "#FEE7E5",
          100: "#FCC7C2",
          400: "#E8372A",
          500: "#D62B1F",
        },
        cream: {
          DEFAULT: "#F5ECD7",
          50: "#FAF6E9",
          100: "#F5ECD7",
        },
        ink: {
          primary: "#F5ECD7",
          secondary: "#9E8E78",
          muted: "#4A4035",
        },
        // legacy aliases (used by other pages — keep them mapped to gold)
        brand: {
          50:  "#FDF1DC",
          100: "#FBE2B5",
          200: "#F8CC7A",
          300: "#F5B53D",
          400: "#F5A623",
          500: "#F5A623",
          600: "#E8891A",
          700: "#C76D11",
          800: "#9C540C",
          900: "#7c2d12",
          950: "#431407",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
        lora: ["var(--font-lora)", "Georgia", "serif"],
        bebas: ["var(--font-bebas)", "Impact", "sans-serif"],
        sans: ["var(--font-lora)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.3em",
      },
      borderColor: {
        DEFAULT: "rgba(245,166,35,0.15)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F5A623 0%, #E8891A 100%)",
        "amber-glow":
          "radial-gradient(circle at 50% 50%, rgba(245,166,35,0.35) 0%, rgba(245,166,35,0) 60%)",
      },
      animation: {
        "marquee": "marquee 38s linear infinite",
        "blink-dot": "blinkDot 1.4s ease-in-out infinite",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-down": "slideDown 0.4s ease-out forwards",
        "spring-in": "springIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-ring": "pulseRing 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blinkDot: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.25" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        springIn: {
          "0%":   { opacity: "0", transform: "scale(0.85)" },
          "60%":  { opacity: "1", transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseRing: {
          "0%":   { transform: "scale(0.95)", opacity: "0.7" },
          "70%":  { transform: "scale(1.6)",  opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
      },
      boxShadow: {
        "amber-glow": "0 20px 60px -12px rgba(245,166,35,0.45)",
        "warm-card":  "0 8px 30px -6px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,166,35,0.08) inset",
      },
    },
  },
  plugins: [],
};

export default config;
