/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "cyber-dark": "#1a1a2e",
        "neon-cyan": "#00d2ff",
        "deep-purple": "#16213e",
        surface: "#0f3460",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      boxShadow: {
        "neon": "0 0 15px rgba(0, 210, 255, 0.5), 0 0 30px rgba(0, 210, 255, 0.2)",
        "neon-lg": "0 0 20px rgba(0, 210, 255, 0.6), 0 0 40px rgba(0, 210, 255, 0.3)",
      },
    },
  },
  plugins: [],
};
