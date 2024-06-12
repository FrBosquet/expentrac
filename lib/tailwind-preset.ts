import { type Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import animatePlugin from 'tailwindcss-animate'

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
        },
        '.scheme-dark': {
          'color-scheme': 'dark'
        },
        '.scheme-light': {
          'color-scheme': 'light'
        }
      })
      addUtilities({
        '.dashboard-label': {
          '@apply text-xs text-theme-light font-semibold uppercase': {}
        },
        '.dashboard-value': { '@apply text-lg text-foreground': {} }
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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          300: 'hsl(var(--primary))', // TODO: These colors should be defined
          600: 'hsl(var(--primary))',
          800: 'hsl(var(--primary))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        expentrac: {
          DEFAULT: '#2dff87',
          300: '#7deead',
          800: '#2aa45e'
        },
        gradient: {
          start: '#2dff87',
          end: '#EDE2D3'
        },
        theme: {
          DEFAULT: '#2dff87',
          back: 'var(--theme-back)',
          border: 'var(--theme-border)',
          front: 'var(--theme-front)',
          light: 'var(--theme-light)',
          accent: 'var(--theme-accent)',
          card: 'var(--theme-card)',
          bottom: 'var(--theme-bottom)'
        }
      },
      fontFamily: {
        sans: 'var(--font-inter)',
        logo: 'var(--font-montserrat)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
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
        },
        'fall-short': {
          from: { transform: 'translateY(-2rem)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        },
        'doc-snapshot': {
          from: {
            transform:
              'rotateY(35deg) rotateX(18deg) scale(1.1) translateX(-100px)',
            opacity: '0.25'
          },
          to: {
            transform:
              'rotateY(5deg) rotateX(5deg) scale(1) translate3d(0, 0, 100px)',
            opacity: '1'
          }
        },
        rise: {
          from: { transform: 'translateY(150px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        },
        'wheel-fade': {
          from: { opacity: '1' },
          to: { opacity: '0' }
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
        'fall-short': 'fall-short 1s ease-out',
        'spin-slow': 'spin 700s linear infinite',
        'spin-slower': 'spin 800s linear infinite',
        'spin-slowest': 'spin 900s linear infinite'
      }
    }
  }
} satisfies Config
