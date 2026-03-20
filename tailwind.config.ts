import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // En mettant 'screens' ici, on remplace totalement les tailles par défaut de Tailwind
    screens: {
      tablet: "640px",
      laptop: "1366px",
      desktop: "1920px",
      "2k": "2560px",
      ultrawide: "3440px",
      "4k": "3840px",
    },
    extend: {
      // Garde ici tes autres configurations personnalisées (couleurs, polices, etc.)
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;
