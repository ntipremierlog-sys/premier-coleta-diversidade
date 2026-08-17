/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premier: {
          primary: "var(--premier-primary)",
          "primary-dark": "var(--premier-primary-dark)",
          secondary: "var(--premier-secondary)",
          accent: "var(--premier-accent)",
          "accent-dark": "var(--premier-accent-dark)",
          success: "var(--premier-success)",
          bg: "var(--premier-bg)",
          surface: "var(--premier-surface)",
          text: "var(--premier-text)",
          "text-muted": "var(--premier-text-muted)",
          border: "var(--premier-border)",
        },
      },
      borderRadius: {
        premier: "var(--radius)",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(11, 37, 69, 0.06), 0 2px 6px -1px rgba(11, 37, 69, 0.04)",
        "card-hover": "0 10px 25px -3px rgba(11, 37, 69, 0.1), 0 4px 10px -2px rgba(11, 37, 69, 0.06)",
      },
    },
  },
  plugins: [],
};
