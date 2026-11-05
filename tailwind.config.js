/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--canvas-bg)",
        foreground: "#18181b",
        shell: {
          DEFAULT: "var(--app-shell-bg)",
          foreground: "#f4f4f5",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-bg)",
          foreground: "#e4e4e7",
          border: "#333333",
        },
      },
      borderRadius: {
        canvas: "var(--canvas-radius)",
        island: "var(--island-radius)",
      },
    },
  },
  plugins: [],
}

