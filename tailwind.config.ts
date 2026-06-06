import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      background: "#fcf9f8",
      ink: "#1c1b1b",
      muted: "#56423c",
      paper: "#fcf9f8",
      surface: "#ffffff",
      "surface-low": "#f6f3f2",
      "surface-mid": "#f0eded",
      "surface-high": "#eae7e7",
      "surface-highest": "#e5e2e1",
      line: "#ddc0b8",
      outline: "#8a726b",
      rust: "#9c3c1e",
      "rust-hover": "#81290c",
      "rust-soft": "#ffdbd1",
      sage: "#50644b",
      "sage-soft": "#d3e9ca",
      sand: "#e5e2e1",
      success: "#50644b",
      clay: "#bc5434",
      marigold: "#a4660d",
      saffron: "#ffb868",
      error: "#ba1a1a",
      "error-soft": "#ffdad6"
    },
    fontFamily: {
      serif: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
      sans: ["Hanken Grotesk", "Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
    },
    boxShadow: {
      soft: "0 18px 45px rgba(28, 27, 27, .05)",
      lift: "0 24px 70px rgba(28, 27, 27, .08)",
      glow: "0 0 0 1px rgba(156, 60, 30, .08), 0 18px 50px rgba(156, 60, 30, .08)"
    }
  } },
  plugins: []
};
export default config;
