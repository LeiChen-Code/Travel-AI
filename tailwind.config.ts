import type { Config } from "tailwindcss";

const config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix:"",
  theme: {
	container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  	extend: {
		fontFamily:{
			sans:["var(--font-noto-sans-sc)", "sans-serif"],
		},
  		colors: {
			// 修改样式
			black:{
				1:'#000000',
				2:'#232323',
				3:'#71788B',
			},
			gray:{
				1:'#D2D0D0',
				2:'#ABABAB',
				3:'#FAFAFA',
				4:'#5E5E5E',
			},
			white:{
				1:'#FFFFFF',
				2:'#FAFAFA'
			},
			blue:{
				1:'#268CFF',
			},
			primary:'#268CFF',
  		},
  		backgroundImage: {
        	"nav-focus":
          		"linear-gradient(270deg, rgba(38, 140, 255, 0.06) 0%, rgba(38, 140, 255, 0.00) 100%)",
      	},
		keyframes: {
			"accordion-down": {
			from: { height: "0" },
			to: { height: "var(--radix-accordion-content-height)" },
			},
			"accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: "0" },
			},
			wiggle1: {
			"0%, 100%": { translate: "25px" },
			"50%": { translate: "-25px" },
			},
			wiggle2: {
			"0%, 100%": { translate: "-25px" },
			"50%": { translate: "25px" },
			},
			wiggle3: {
			"0%, 100%": { translate: "40px" },
			"50%": { translate: "-40px" },
			},
		},
		animation: {
			"accordion-down": "accordion-down 0.2s ease-out",
			"accordion-up": "accordion-up 0.2s ease-out",
			"wiggle1-left-right": "wiggle1 12s infinite ease-in-out forwards",
			"wiggle2-left-right": "wiggle2 12s infinite ease-in-out forwards",
			"wiggle3-left-right": "wiggle3 12s infinite ease-in-out forwards",
		},
  	}
  },
  plugins: [
	require("tailwindcss-animate"),
	require("@tailwindcss/typography"),
  ],
} satisfies Config;

export default config;
