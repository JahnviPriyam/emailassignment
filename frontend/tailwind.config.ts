import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: {
            DEFAULT: "#ffb6c1", // Pastel Pink (primary action)
            light: "#ffd6de",
            vibrant: "#f497a9",
            dark: "#eb8397",
            hover: "#df6e85",
            bg: "#fff5f7",
          },
          blue: {
            DEFAULT: "#8bc6ec", // Pastel Blue (active tabs, highlights)
            light: "#e0f2fe",
            soft: "#a2d2ff",
            dark: "#60a5fa",
            hover: "#3b82f6",
            bg: "#f0f8ff", // Very light pastel blue background
          },
        },
        slate: {
          850: "#1e293b",
          900: "#0f172a",
        },
      },
      borderRadius: {
        "2xl": "16px", // Required rounded corners
        "3xl": "24px",
      },
      boxShadow: {
        "soft-sm": "0 2px 8px -2px rgba(139, 198, 236, 0.15), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
        "soft-md": "0 10px 25px -5px rgba(255, 182, 193, 0.25), 0 8px 10px -6px rgba(139, 198, 236, 0.1)",
        "soft-lg": "0 20px 35px -10px rgba(139, 198, 236, 0.35), 0 10px 15px -5px rgba(255, 182, 193, 0.2)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
