import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#2A2724", muted: "#746E67", paper: "#FBF8F3", surface: "#FFFFFF", line: "#E7DED3", rust: "#B85C43", "rust-hover": "#9C4936", sage: "#7E9478", sand: "#EEE4D5", success: "#5E8263", clay: "#C98A6B", marigold: "#D5A24C" },
    fontFamily: { serif: ["Georgia", "Times New Roman", "serif"], sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
    boxShadow: { soft: "0 16px 42px rgba(42, 39, 36, .08)", lift: "0 18px 50px rgba(42, 39, 36, .12)" }
  } },
  plugins: []
};
export default config;
