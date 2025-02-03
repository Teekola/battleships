import type { Config } from "tailwindcss";
import tailwindCssAnimate from "tailwindcss-animate";

export default {
   darkMode: ["class"],
   content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
   ],
   theme: {
      extend: {
         screens: {
            xs: "376px",
         },
         fontFamily: {
            sans: ["var(--font-geist-sans)"],
         },
         colors: {
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            card: {
               DEFAULT: "hsl(var(--card))",
               foreground: "hsl(var(--card-foreground))",
            },
            popover: {
               DEFAULT: "hsl(var(--popover))",
               foreground: "hsl(var(--popover-foreground))",
            },
            primary: {
               DEFAULT: "hsl(var(--primary))",
               foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
               DEFAULT: "hsl(var(--secondary))",
               foreground: "hsl(var(--secondary-foreground))",
            },
            muted: {
               DEFAULT: "hsl(var(--muted))",
               foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
               DEFAULT: "hsl(var(--accent))",
               foreground: "hsl(var(--accent-foreground))",
            },
            destructive: {
               DEFAULT: "hsl(var(--destructive))",
               foreground: "hsl(var(--destructive-foreground))",
            },
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            chart: {
               "1": "hsl(var(--chart-1))",
               "2": "hsl(var(--chart-2))",
               "3": "hsl(var(--chart-3))",
               "4": "hsl(var(--chart-4))",
               "5": "hsl(var(--chart-5))",
            },
         },
         borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
         },
         keyframes: {
            "caret-blink": {
               "0%,70%,100%": { opacity: "1" },
               "20%,50%": { opacity: "0" },
            },
            hit: {
               "0%": {
                  transform: "translate(var(--hit-offset-x),var(--hit-offset-y)) scale(0.5)",
                  opacity: "0",
                  left: "0",
                  top: "0",
               },
               "100%": {
                  transform: "translate(-50%,-50%) scale(1)",
                  opacity: "1",
                  left: "50%",
                  top: "50%",
               },
            },
            "sink-ship": {
               "0%": {
                  borderColor: "rgba(55, 65, 81, 1)",
                  backgroundColor: "rgba(107, 114, 128, 1)",
                  opacity: "0",
               },
               "15%": {
                  borderColor: "rgba(186, 28, 28, 0.3)",
                  backgroundColor: "rgba(127, 29, 29, 0.3)",
                  opacity: "0",
               },
               "100%": {
                  borderColor: "rgba(186, 28, 28, 0.3)",
                  backgroundColor: "rgba(127, 29, 29, 0.3)",
                  opacity: "1",
               },
            },
         },
         animation: {
            "caret-blink": "caret-blink 1.25s ease-out infinite",
            hit: "hit .15s ease-out forwards",
            "sink-ship": "sink-ship 1s ease-out forwards",
         },
      },
   },
   plugins: [tailwindCssAnimate],
} satisfies Config;
