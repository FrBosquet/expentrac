import { type Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'

export const tailwindPreset = {
  darkMode: ['class'],
  content: [],
  plugins: [animatePlugin],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        primary: {
          300: '#7deead',
          600: '#2dff87',
          800: '#2aa45e'
        },
        secondary: '#EDE2D3',
        gradient: {
          start: '#2dff87',
          end: '#EDE2D3'
        }
      },
      fontFamily: {
        sans: ['__Inter_20951f', '__Inter_Fallback_20951f'],
        logo: ['__montserrat_d57222', '__montserrat_Fallback_d57222']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      blur: {
        xs: '2px'
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin 700s linear infinite',
        'spin-slower': 'spin 800s linear infinite',
        'spin-slowest': 'spin 900s linear infinite'
      }
    }
  }
} satisfies Config
