/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4a85d9",
          hover: "#2c62aa",
        },
        secondary: {
          DEFAULT: "#7BC8A4",
        },
        accent: {
          DEFAULT: "#F4A261",
        },
        background: {
          light: "#F8FAFC",
          section: "#EEF2F7",
          dark: "#121820",
        },
        "section-bg": "#EEF2F7",
        text: {
          main: "#1F2933",
          secondary: "#6B7280",
        },
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
