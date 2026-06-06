import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      background: "#FFFFFF",
      ink: "#241124",
      muted: "#602060",
      paper: "#FFFFFF",
      surface: "#ffffff",
      "surface-low": "#fff7fa",
      "surface-mid": "#fde7ee",
      "surface-high": "#F7A1B5",
      "surface-highest": "#F38FA4",
      line: "#F7A1B5",
      outline: "#69296A",
      rust: "#69296A",
      "rust-hover": "#602060",
      "rust-soft": "#F7A1B5",
      sage: "#F38FA4",
      "sage-soft": "#F7A1B5",
      sand: "#FFFFFF",
      success: "#69296A",
      clay: "#F38FA4",
      marigold: "#F38FA4",
      saffron: "#F7A1B5",
      error: "#602060",
      "error-soft": "#F7A1B5"
    },
    fontFamily: {
      serif: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
      sans: ["Hanken Grotesk", "Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
    },
    boxShadow: {
      soft: "0 18px 45px rgba(105, 41, 106, .08)",
      lift: "0 24px 70px rgba(105, 41, 106, .14)",
      glow: "0 0 0 1px rgba(105, 41, 106, .12), 0 18px 50px rgba(243, 143, 164, .2)"
    }
  } },
  plugins: []
};
export default config;
