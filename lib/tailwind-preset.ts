import { type Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import plugin from 'tailwindcss/plugin'

export const tailwindPreset = {
  darkMode: ['class'],
  content: [],
  plugins: [
    animatePlugin,
    plugin(function ({ addComponents, addUtilities }) {
      addComponents({
        '.perspective-wheel': {
          transform: 'rotateY(300deg) rotateX(20deg)'
        }
      })
      addUtilities({
        '.perspective-container': {
          '--perspective': '1000px',
          '--perspective-origin': '50% 50%',
          perspective: 'var(--perspective)',
          'perspective-origin': 'var(--perspective-origin)',
          '-webkit-perspective': 'var(--perspective)',
          '-webkit-perspective-origin': 'var(--perspective-origin)',
          '-moz-perspective': 'var(--perspective)',
          '-moz-perspective-origin': 'var(--perspective-origin)'
        },
        '.scroll-anim-snapshot': {
          'view-timeline-name': '--snapshot',
          'view-timeline-axis': 'block',
          'animation-range': 'entry 25% cover 75%',
          'animation-timeline': '--snapshot',
          'animation-name': 'doc-snapshot',
          'animation-fill-mode': 'both'
        },
        '.scroll-anim-fall': {
          'view-timeline-name': '--fall',
          'view-timeline-axis': 'block',
          'animation-range': 'entry 0% cover 100%',
          'animation-timeline': '--fall',
          'animation-name': 'fall',
          'animation-fill-mode': 'both'
        },
        '.scroll-anim-rise': {
          'view-timeline-name': '--rise',
          'view-timeline-axis': 'block',
          'animation-range': 'entry 0% cover 80%',
          'animation-timeline': '--rise',
          'animation-name': 'rise',
          'animation-fill-mode': 'both'
        },
        '.scroll-anim-fade': {
          'view-timeline-name': '--fade',
          'view-timeline-axis': 'block',
          'animation-range': '50% 90%',
          'animation-timeline': '--fade',
          'animation-name': 'wheel-fade',
          'animation-fill-mode': 'both'
        }
      })
    })
  ],
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
        },
        fall: {
          from: { transform: 'translateY(-10vh)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        }
      },
      blur: {
        xs: '2px'
      },
      boxShadow: {
        'bloom-md': '0 0 6px 2px #ffffffff, 0 0 120px 15px #ffffff55',
        'bloom-sm': '0 0 3px 1px #ffffffff, 0 0 60px 7.5px #ffffff55',
        'bloom-green': '1px 0 1px 1px #7deead, 3px 1px 200px 7.5px #ffffff55'
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fall: 'fall 1s ease-out',
        'spin-slow': 'spin 700s linear infinite',
        'spin-slower': 'spin 800s linear infinite',
        'spin-slowest': 'spin 900s linear infinite'
      }
    }
  }
} satisfies Config
