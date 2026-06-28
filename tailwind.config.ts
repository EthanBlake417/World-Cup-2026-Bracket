import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#0b6b3a",
        pitchdark: "#085029",
      },
    },
  },
  plugins: [],
};

export default config;
