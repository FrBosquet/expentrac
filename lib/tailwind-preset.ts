import { Config } from "tailwindcss"
import animatePlugin from "tailwindcss-animate"

export const tailwindPreset = {
  darkMode: ["class"],
  content: [],
  plugins: [animatePlugin],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: '#6985C0',
        secondary: '#FFD37E',
        gradient: {
          start: '#799AE3',
          end: '#EDE2D3',
        }
      },
      fontFamily: {
        sans: ['__Oswald_2880cd', '__Oswald_Fallback_2880cd'],
        logo: ['__montserrat_d57222', '__montserrat_Fallback_d57222'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: '0' },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: '0' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
} satisfies Config

